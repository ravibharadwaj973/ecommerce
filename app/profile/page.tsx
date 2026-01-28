"use client";

import { useState, useEffect } from "react";
import { User, MapPin, Package, LogOut, Loader2, Plus, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Form States
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [addressForm, setAddressForm] = useState({
    fullName: "", phone: "", addressLine1: "", city: "", state: "", postalCode: "", label: "home"
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [userRes, addrRes] = await Promise.all([
        fetch("/api/users/profile"), // Adjust path if your file is in api/users/profile/route.js
        fetch("/api/addresses")
      ]);
      const userData = await userRes.json();
      const addrData = await addrRes.json();

      if (userData.success) {
        setUser(userData.data.user);
        setProfileForm({ name: userData.data.user.name, phone: userData.data.user.phone || "" });
      }
      if (addrData.success) setAddresses(addrData.data);
    } catch (err) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const result = await res.json();
      if (result.success) {
        setUser(result.data.user);
        setIsEditingProfile(false);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const result = await res.json();
      if (result.success) {
        setAddresses([result.data, ...addresses]);
        setShowAddressForm(false);
        toast.success("Address added");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to add address");
    }
  };

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      toast.success("Logged out");
      router.push("/login");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">My Account<span className="text-blue-600">.</span></h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Personal details & shipping</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-all">
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: PROFILE INFO */}
        <div className="lg:col-span-5">
          <section className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight italic">Profile Details</h2>
              {!isEditingProfile ? (
                <button onClick={() => setIsEditingProfile(true)} className="text-[10px] font-black uppercase text-blue-600 underline">Edit</button>
              ) : (
                <div className="flex gap-4">
                  <button onClick={handleUpdateProfile} className="text-green-600"><Check size={20}/></button>
                  <button onClick={() => setIsEditingProfile(false)} className="text-red-500"><X size={20}/></button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-2">Full Name</label>
                {isEditingProfile ? (
                  <input value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm font-bold focus:border-black outline-none" />
                ) : (
                  <p className="text-lg font-bold text-gray-900">{user?.name}</p>
                )}
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-2">Email Address</label>
                <p className="text-lg font-bold text-gray-500">{user?.email}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-2">Phone Number</label>
                {isEditingProfile ? (
                  <input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm font-bold focus:border-black outline-none" />
                ) : (
                  <p className="text-lg font-bold text-gray-900">{user?.phone || "Not provided"}</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: ADDRESSES */}
        <div className="lg:col-span-7">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight italic">Saved Addresses</h2>
            <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-black text-white p-2 rounded-full hover:scale-110 transition-all">
              <Plus size={20} />
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="mb-8 bg-white text-black border-2 border-dashed border-gray-200 rounded-[2rem] p-6 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
              <input placeholder="Full Name" required className="col-span-2 p-3 bg-gray-50 rounded-xl text-xs font-bold outline-none" onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} />
              <input placeholder="Phone" required className="p-3 bg-gray-50 rounded-xl text-xs font-bold outline-none" onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
              <input placeholder="Label (Home/Office)" className="p-3 bg-gray-50 rounded-xl text-xs font-bold outline-none" onChange={e => setAddressForm({...addressForm, label: e.target.value})} />
              <input placeholder="Address Line 1" required className="col-span-2 p-3 bg-gray-50 rounded-xl text-xs font-bold outline-none" onChange={e => setAddressForm({...addressForm, addressLine1: e.target.value})} />
              <input placeholder="City" required className="p-3 bg-gray-50 rounded-xl text-xs font-bold outline-none" onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
              <input placeholder="Postal Code" required className="p-3 bg-gray-50 rounded-xl text-xs font-bold outline-none" onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} />
              <button type="submit" className="col-span-2 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all">Save Address</button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr._id} className="p-6 border border-gray-100 rounded-[2rem] bg-white hover:shadow-xl transition-all group relative">
                <span className="inline-block px-2 py-1 bg-gray-100 rounded-lg text-[8px] font-black uppercase tracking-widest mb-3">{addr.label}</span>
                <p className="font-bold text-sm text-gray-900">{addr.fullName}</p>
                <p className="text-xs text-gray-500 mt-1">{addr.addressLine1}</p>
                <p className="text-xs text-gray-500">{addr.city}, {addr.postalCode}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-3 italic">{addr.phone}</p>
                {addr.isDefault && <div className="absolute top-6 right-6 h-2 w-2 bg-blue-600 rounded-full"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}