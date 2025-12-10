import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

type Option = {
    label: string
    value: string
}

interface MultiSelectProps {
    options: Option[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    emptyMessage?: string
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    emptyMessage = "No results found."
}: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const handleUnselect = React.useCallback((value: string) => {
        onChange(selected.filter((s) => s !== value))
    }, [onChange, selected])

    const handleSelect = React.useCallback((value: string) => {
        setInputValue("")
        if (selected.includes(value)) {
            onChange(selected.filter((s) => s !== value))
        } else {
            onChange([...selected, value])
        }
    }, [onChange, selected])

    const selectables = options.filter((option) => !selected.includes(option.value))

    return (
        <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
            <div
                className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            >
                <div className="flex gap-1 flex-wrap">
                    {selected.map((value) => {
                        const option = options.find((o) => o.value === value)
                        return (
                            <Badge key={value} variant="secondary">
                                {option ? option.label : value}
                                <button
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnselect(value)
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                    onClick={() => handleUnselect(value)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        )
                    })}
                    {/* Avoid having the "Search" Input wrapper background, but keep interaction */}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder}
                        className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
                    />
                </div>
            </div>
            <div className="relative mt-2">
                {open && selectables.length > 0 ? (
                    <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandList>
                            <CommandGroup className="h-full overflow-auto">
                                {selectables.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            setInputValue("")
                                            onChange([...selected, option.value])
                                        }}
                                        className="cursor-pointer"
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                    >
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                ) : null}
                {open && selectables.length === 0 && (
                    <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none p-2 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                    </div>
                )}
            </div>
        </Command>
    )
}

const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent default form submission or other bubbling if inside a form
    if (e.key === "Enter") {
        e.preventDefault();
    }
}
