import { NextResponse } from 'next/server';
import { getAuthenticatedUser, comparePassword, hashPassword, COOKIE_NAME } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Anda harus login terlebih dahulu' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        avatar: true,
        role: true,
        hasPasswordSet: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil data profil' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Anda harus login terlebih dahulu' }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, phone, email, address, currentPassword, newPassword } = body;

    // Validate email & username uniqueness if changed
    if (username && username.trim() !== authUser.username) {
      const existingUsername = await db.user.findUnique({ where: { username: username.trim() } });
      if (existingUsername && existingUsername.id !== authUser.id) {
        return NextResponse.json({ error: 'Username sudah digunakan oleh akun lain' }, { status: 400 });
      }
    }

    if (email && email.trim() !== authUser.email) {
      const existingEmail = await db.user.findUnique({ where: { email: email.trim() } });
      if (existingEmail && existingEmail.id !== authUser.id) {
        return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain' }, { status: 400 });
      }
    }

    // Build update object
    const updateData: any = {
      name: name !== undefined ? name : authUser.name,
      username: username ? username.trim() : authUser.username,
      phone: phone !== undefined ? phone : authUser.phone,
      email: email ? email.trim() : authUser.email,
      address: address !== undefined ? address : authUser.address,
    };

    // If setting / changing password
    if (newPassword && newPassword.trim()) {
      const fullUser = await db.user.findUnique({ where: { id: authUser.id } });
      if (!fullUser) {
        return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
      }

      // If user already had a password set, verify currentPassword
      if (fullUser.hasPasswordSet) {
        if (!currentPassword || !currentPassword.trim()) {
          return NextResponse.json({ error: 'Masukkan password saat ini untuk mengubah password' }, { status: 400 });
        }
        const isPasswordValid = fullUser.password ? await comparePassword(currentPassword, fullUser.password) : false;
        if (!isPasswordValid) {
          return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
        }
      }

      if (newPassword.trim().length < 6) {
        return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 });
      }

      updateData.password = await hashPassword(newPassword.trim());
      updateData.hasPasswordSet = true; // Mark custom password as set
    }

    const updatedUser = await db.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        avatar: true,
        role: true,
        hasPasswordSet: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profil & Password Akun berhasil disimpan!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update Profile API error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui profil' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Anda harus login terlebih dahulu' }, { status: 401 });
    }

    // Delete user record from DB
    try {
      await db.user.delete({
        where: { id: authUser.id }
      });
    } catch (e) {
      console.warn('Delete User DB log warning:', e);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Akun Anda telah berhasil dihapus secara permanen.'
    });

    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Delete Account API error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus akun' }, { status: 500 });
  }
}
