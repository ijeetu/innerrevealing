"use client";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountryRegionData } from "react-country-region-selector";
import { cn } from "@/lib/utils";

const countries = CountryRegionData as unknown as [string, string, string][];

function getFlagEmoji(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

interface CountrySelectorProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
  placeholder?: string;
}

export default function CountrySelector({
  value,
  onChange,
  className,
  placeholder = "Select country...",
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);

  const selected = countries.find(([, code]) => code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal border borderColor rounded-[4px] p-3 text-sm h-auto",
            className
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span>{getFlagEmoji(selected[1])}</span>
              <span>{selected[0]}</span>
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-60">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map(([name, code]) => (
                <CommandItem
                  key={code}
                  value={`${name} ${code}`}
                  onSelect={() => {
                    onChange(code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{getFlagEmoji(code)}</span>
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
