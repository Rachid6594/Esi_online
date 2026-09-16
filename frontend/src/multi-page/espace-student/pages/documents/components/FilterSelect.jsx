import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ALL_VALUE = '__all__'

export default function FilterSelect({ id, label, icon: Icon, value, onChange, options, placeholder }) {
  return (
    <div className="min-w-0 flex-1 space-y-1">
      <Label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={2} />
        {label}
      </Label>
      <Select
        value={value || ALL_VALUE}
        onValueChange={(v) => onChange(v === ALL_VALUE ? '' : v)}
      >
        <SelectTrigger id={id} className="w-full font-medium">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
