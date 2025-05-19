import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

const formatCurrency = (cents: number) => {
  const dollars = cents / 100;

  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
};

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const cents = Math.round((value || 0) * 100);
    setDisplayValue(formatCurrency(cents));
  }, [value]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, '');
    const numericValue = Number(inputValue);
    const dollars = numericValue / 100;
    setDisplayValue(formatCurrency(numericValue));

    onChange(dollars);
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleOnChange}
    />
  );
};

export default CurrencyInput;