import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const PartnersContext = createContext();

export const usePartners = () => {
  const context = useContext(PartnersContext);
  if (!context) {
    throw new Error('usePartners must be used within a PartnersProvider');
  }
  return context;
};

export const PartnersProvider = ({ children }) => {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load partners from Supabase
  const loadPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('partners')
        .select('*')
        .order('name', { ascending: true });
      
      if (fetchError) throw fetchError;
      setPartners(data || []);
    } catch (err) {
      console.error('Error loading partners:', err);
      setError(err.message);
      setPartners([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load partners on mount
  useEffect(() => {
    loadPartners();
  }, []);

  // Create partner
  const createPartner = async (partnerData) => {
    try {
      const { data, error: createError } = await supabase
        .from('partners')
        .insert([partnerData])
        .select()
        .single();
      
      if (createError) throw createError;
      setPartners((prevPartners) => [...prevPartners, data]);
      return data;
    } catch (err) {
      console.error('Error creating partner:', err);
      throw err;
    }
  };

  // Update partner
  const updatePartner = async (id, partnerData) => {
    try {
      const { data, error: updateError } = await supabase
        .from('partners')
        .update(partnerData)
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      setPartners((prevPartners) =>
        prevPartners.map((partner) => (partner.id === id ? data : partner))
      );
      return data;
    } catch (err) {
      console.error('Error updating partner:', err);
      throw err;
    }
  };

  // Delete partner
  const deletePartner = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      setPartners((prevPartners) => prevPartners.filter((partner) => partner.id !== id));
    } catch (err) {
      console.error('Error deleting partner:', err);
      throw err;
    }
  };

  // Get all partners
  const getAllPartners = () => {
    return partners;
  };

  // Get partner by ID
  const getPartnerById = (id) => {
    return partners.find((partner) => partner.id === id);
  };

  const value = {
    partners,
    isLoading,
    error,
    loadPartners,
    createPartner,
    updatePartner,
    deletePartner,
    getAllPartners,
    getPartnerById,
  };

  return (
    <PartnersContext.Provider value={value}>
      {children}
    </PartnersContext.Provider>
  );
};

