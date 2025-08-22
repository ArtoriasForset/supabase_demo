'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Address = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export default function TestPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      const { data } = await supabase.from('address').select('*'); 
      setAddresses(data || []);
      setLoading(false);
    };
    fetchAddresses();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1>Address 数据 ({addresses.length} 条)</h1>
      {addresses.map((addr, i) => (
        <div key={addr.id} className="border p-4 m-2">
          <h3>{i + 1}. {addr.name}</h3>
          <p>地址: {addr.address}</p>
          <p>坐标: {addr.lat}, {addr.lng}</p>
        </div>
      ))}
    </div>
  );
}