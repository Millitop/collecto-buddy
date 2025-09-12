import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Item } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export const useItems = (userId?: string) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching items:', error);
        toast({
          title: 'Fel vid hämtning',
          description: 'Kunde inte hämta din samling.',
          variant: 'destructive'
        });
        return;
      }

      const processedItems: Item[] = (data || []).map(item => ({
        ...item,
        identifiers: Array.isArray(item.identifiers) ? item.identifiers as string[] : [],
        authenticity_flags: Array.isArray(item.authenticity_flags) ? item.authenticity_flags as string[] : [],
        images: Array.isArray(item.images) ? item.images as string[] : [],
        subcategory: item.subcategory || '',
        maker_brand: item.maker_brand || '',
        year_or_period: item.year_or_period || '',
        set_or_model: item.set_or_model || '',
        condition_notes: item.condition_notes || '',
        price_low: item.price_low || 0,
        price_mid: item.price_mid || 0,
        price_high: item.price_high || 0,
        confidence: item.confidence || 0,
      }));

      setItems(processedItems);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Oväntat fel',
        description: 'Ett oväntat fel uppstod.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [userId]);

  const addItem = async (itemData: Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('items')
        .insert([{
          ...itemData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding item:', error);
        toast({
          title: 'Fel vid sparande',
          description: 'Kunde inte spara objektet.',
          variant: 'destructive'
        });
        return { error };
      }

      const processedItem: Item = {
        ...data,
        identifiers: Array.isArray(data.identifiers) ? data.identifiers as string[] : [],
        authenticity_flags: Array.isArray(data.authenticity_flags) ? data.authenticity_flags as string[] : [],
        images: Array.isArray(data.images) ? data.images as string[] : [],
        subcategory: data.subcategory || '',
        maker_brand: data.maker_brand || '',
        year_or_period: data.year_or_period || '',
        set_or_model: data.set_or_model || '',
        condition_notes: data.condition_notes || '',
        price_low: data.price_low || 0,
        price_mid: data.price_mid || 0,
        price_high: data.price_high || 0,
        confidence: data.confidence || 0,
      };

      setItems(prev => [processedItem, ...prev]);
      toast({
        title: 'Objekt sparat!',
        description: `${itemData.title} har lagts till i din samling.`,
      });

      return { data: processedItem, error: null };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Oväntat fel',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating item:', error);
        toast({
          title: 'Fel vid uppdatering',
          description: 'Kunde inte uppdatera objektet.',
          variant: 'destructive'
        });
        return { error };
      }

      const processedItem: Item = {
        ...data,
        identifiers: Array.isArray(data.identifiers) ? data.identifiers as string[] : [],
        authenticity_flags: Array.isArray(data.authenticity_flags) ? data.authenticity_flags as string[] : [],
        images: Array.isArray(data.images) ? data.images as string[] : [],
        subcategory: data.subcategory || '',
        maker_brand: data.maker_brand || '',
        year_or_period: data.year_or_period || '',
        set_or_model: data.set_or_model || '',
        condition_notes: data.condition_notes || '',
        price_low: data.price_low || 0,
        price_mid: data.price_mid || 0,
        price_high: data.price_high || 0,
        confidence: data.confidence || 0,
      };

      setItems(prev => prev.map(item => item.id === id ? processedItem : item));
      return { data: processedItem, error: null };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return { error };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting item:', error);
        toast({
          title: 'Fel vid borttagning',
          description: 'Kunde inte ta bort objektet.',
          variant: 'destructive'
        });
        return { error };
      }

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Objekt borttaget',
        description: 'Objektet har tagits bort från din samling.',
      });

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return { error };
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  };
};