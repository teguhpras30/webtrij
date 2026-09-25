'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Loader2 } from 'lucide-react';

export interface LocationItem {
  id: string;
  name: string;
}

interface ShopeeLocationPickerDropdownProps {
  value: string;
  onChange: (fullValue: string, province: string, city: string, district: string, postalCode: string) => void;
}

export const ShopeeLocationPickerDropdown: React.FC<ShopeeLocationPickerDropdownProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'provinsi' | 'kota' | 'kecamatan' | 'kodePos'>('provinsi');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Live Location Data Lists
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [regencies, setRegencies] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [villages, setVillages] = useState<LocationItem[]>([]);

  // Selected State Cascading Objects (Empty by default)
  const [selectedProvince, setSelectedProvince] = useState<LocationItem>({ id: '', name: '' });
  const [selectedCity, setSelectedCity] = useState<LocationItem>({ id: '', name: '' });
  const [selectedDistrict, setSelectedDistrict] = useState<LocationItem>({ id: '', name: '' });
  const [selectedPostalCode, setSelectedPostalCode] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse initial string value if provided
  useEffect(() => {
    if (value && value.trim()) {
      const parts = value.split(', ').map((s) => s.trim());
      if (parts.length >= 4) {
        setSelectedProvince((prev) => ({ ...prev, name: parts[0] }));
        setSelectedCity((prev) => ({ ...prev, name: parts[1] }));
        setSelectedDistrict((prev) => ({ ...prev, name: parts[2] }));
        setSelectedPostalCode(parts[3]);
      }
    } else {
      setSelectedProvince({ id: '', name: '' });
      setSelectedCity({ id: '', name: '' });
      setSelectedDistrict({ id: '', name: '' });
      setSelectedPostalCode('');
    }
  }, [value]);

  // Fetch Provinces on Component Mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/location/wilayah?type=provinces');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setProvinces(data);
        }
      } catch (err) {
        console.warn('Failed to fetch live provinces:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch Regencies when selectedProvince changes
  useEffect(() => {
    if (!selectedProvince.id) return;
    const fetchRegencies = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/location/wilayah?type=regencies&id=${selectedProvince.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setRegencies(data);
        }
      } catch (err) {
        console.warn('Failed to fetch regencies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegencies();
  }, [selectedProvince.id]);

  // Fetch Districts when selectedCity changes
  useEffect(() => {
    if (!selectedCity.id) return;
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/location/wilayah?type=districts&id=${selectedCity.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setDistricts(data);
        }
      } catch (err) {
        console.warn('Failed to fetch districts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, [selectedCity.id]);

  // Fetch Villages when selectedDistrict changes
  useEffect(() => {
    if (!selectedDistrict.id) return;
    const fetchVillages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/location/wilayah?type=villages&id=${selectedDistrict.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setVillages(data);
        }
      } catch (err) {
        console.warn('Failed to fetch villages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVillages();
  }, [selectedDistrict.id]);

  // Available Items for Current Active Tab
  const optionsForTab = useMemo(() => {
    let list: LocationItem[] = [];

    if (activeTab === 'provinsi') {
      list = provinces;
    } else if (activeTab === 'kota') {
      list = regencies;
    } else if (activeTab === 'kecamatan') {
      list = districts;
    } else if (activeTab === 'kodePos') {
      list = villages.length > 0 ? villages : [{ id: '17530', name: '17530' }];
    }

    if (!searchTerm.trim()) return list;
    return list.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeTab, provinces, regencies, districts, villages, searchTerm]);

  // Handle Item Selection in Active Tab
  const handleSelectItem = (item: LocationItem) => {
    if (activeTab === 'provinsi') {
      setSelectedProvince(item);
      setActiveTab('kota');
    } else if (activeTab === 'kota') {
      setSelectedCity(item);
      setActiveTab('kecamatan');
    } else if (activeTab === 'kecamatan') {
      setSelectedDistrict(item);
      setActiveTab('kodePos');
    } else if (activeTab === 'kodePos') {
      setSelectedPostalCode(item.name);
      const fullVal = `${selectedProvince.name}, ${selectedCity.name}, ${selectedDistrict.name}, ${item.name}`;
      onChange(fullVal, selectedProvince.name, selectedCity.name, selectedDistrict.name, item.name);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm('');
  };

  const parts = [selectedProvince.name, selectedCity.name, selectedDistrict.name, selectedPostalCode].filter(Boolean);
  const displayValue = value ? value : parts.join(', ');

  return (
    <div ref={containerRef} className="relative w-full font-sans text-xs">
      {/* Search & Input Trigger Box (Exact Shopee Style) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative border border-gray-300 rounded focus-within:border-gray-500 p-2 pt-1 bg-white cursor-pointer flex items-center justify-between transition-all"
      >
        <div className="flex-1 min-w-0 pr-2">
          <label className="block text-[10px] text-gray-400 font-normal">
            Provinsi, Kota, Kecamatan, Kode Pos
          </label>
          <input
            type="text"
            readOnly={!isOpen}
            value={isOpen ? searchTerm || displayValue : displayValue}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pilih Provinsi, Kota, Kecamatan, Kode Pos..."
            className="w-full bg-transparent text-gray-800 font-bold focus:outline-none uppercase truncate text-xs cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#EE4D2D]" />}
          {searchTerm && (
            <button type="button" onClick={handleClear} className="p-0.5 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Search className="w-3.5 h-3.5" />
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Shopee Location Picker Dropdown Box */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded shadow-xl overflow-hidden animate-in fade-in duration-150">
          {/* Tab Header Bar (Provinsi | Kota | Kecamatan | Kode Pos) */}
          <div className="flex items-center border-b border-gray-200 bg-white text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('provinsi')}
              className={`flex-1 py-2.5 text-center font-bold transition-all relative cursor-pointer ${
                activeTab === 'provinsi'
                  ? 'text-[#EE4D2D] border-b-2 border-[#EE4D2D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Provinsi
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kota')}
              className={`flex-1 py-2.5 text-center font-bold transition-all relative cursor-pointer ${
                activeTab === 'kota'
                  ? 'text-[#EE4D2D] border-b-2 border-[#EE4D2D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kota
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kecamatan')}
              className={`flex-1 py-2.5 text-center font-bold transition-all relative cursor-pointer ${
                activeTab === 'kecamatan'
                  ? 'text-[#EE4D2D] border-b-2 border-[#EE4D2D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kecamatan
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kodePos')}
              className={`flex-1 py-2.5 text-center font-bold transition-all relative cursor-pointer ${
                activeTab === 'kodePos'
                  ? 'text-[#EE4D2D] border-b-2 border-[#EE4D2D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kode Pos / Desa
            </button>
          </div>

          {/* Options List Body */}
          <div className="max-h-56 overflow-y-auto p-2 space-y-0.5">
            {loading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-gray-500 text-xs font-semibold">
                <Loader2 className="w-4 h-4 animate-spin text-[#EE4D2D]" />
                <span>Memuat data wilayah...</span>
              </div>
            ) : optionsForTab.length === 0 ? (
              <div className="py-4 text-center text-gray-400 text-xs font-normal">
                Tidak ada pilihan ditemukan.
              </div>
            ) : (
              optionsForTab.map((item) => {
                const isSelected =
                  (activeTab === 'provinsi' && selectedProvince.id === item.id) ||
                  (activeTab === 'kota' && selectedCity.id === item.id) ||
                  (activeTab === 'kecamatan' && selectedDistrict.id === item.id) ||
                  (activeTab === 'kodePos' && selectedPostalCode === item.name);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`px-3 py-2 text-xs rounded cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'text-[#EE4D2D] font-extrabold bg-orange-50/50'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-normal'
                    }`}
                  >
                    <span>{item.name}</span>
                    {isSelected && <span className="text-[#EE4D2D] text-xs font-bold">✓</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
