import {
  Home, Search, ShoppingCart, User, Heart, Star, StarHalf, StarOff,
  Compass, Receipt, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Plus, Minus, X, Check, AlertCircle, Info, CheckCircle, XCircle, AlertTriangle,
  Eye, EyeOff, Lock, Mail, Phone, MapPin, Calendar, Clock, Truck, CreditCard,
  Wallet, Gift, Package, Tag, Filter, SortAsc, SortDesc, Menu, Settings, LogOut,
  Edit, Trash2, Download, Upload, Share, Bookmark, MessageCircle, Bell, Camera,
  Image, FileText, Grid, List, Maximize, Minimize, RefreshCw, RotateCcw, ZoomIn,
  ZoomOut, Move, Copy, Link, ExternalLink, ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  ArrowUpRight, ArrowDownLeft, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight,
  SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, Mic, MicOff, Video, VideoOff,
  Monitor, Smartphone, Tablet, Laptop, Printer, Wifi, WifiOff, Bluetooth, Battery, BatteryCharging,
  Power, PowerOff, Zap, ZapOff, Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, Wind,
  Umbrella, Droplets, Thermometer, Navigation, Map, Globe, Flag, Shield, ShieldCheck, ShieldAlert,
  ShieldX, Key, Unlock, Database, Server, HardDrive, Cpu, MemoryStick, Mouse, Keyboard, Headphones,
  Speaker, Radio, Tv, Gamepad, Palette, Brush, PenTool, Type, Bold, Italic, Underline,
  Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Quote, Code, Terminal, Command,
  Slash, Hash, AtSign, DollarSign, Percent, Divide, Equal, Infinity,
  // Additional icons for MDI replacements
  Activity, Baby, Circle, Droplet, DropletOff, Flame, HelpCircle, PackageCheck, PlayCircle,
  Sparkles, Users, UserCircle, UserPlus, Wrench, Briefcase, Waves, CircleDot
} from 'lucide-vue-next'

export default {
  install: (app) => {
    const icons = {
      Home, Search, ShoppingCart, User, Heart, Star, StarHalf, StarOff,
      Compass, Receipt, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
      Plus, Minus, X, Check, AlertCircle, Info, CheckCircle, XCircle, AlertTriangle,
      Eye, EyeOff, Lock, Mail, Phone, MapPin, Calendar, Clock, Truck, CreditCard,
      Wallet, Gift, Package, Tag, Filter, SortAsc, SortDesc, Menu, Settings, LogOut,
      Edit, Trash2, Download, Upload, Share, Bookmark, MessageCircle, Bell, Camera,
      Image, FileText, Grid, List, Maximize, Minimize, RefreshCw, RotateCcw, ZoomIn,
      ZoomOut, Move, Copy, Link, ExternalLink, ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
      ArrowUpRight, ArrowDownLeft, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight,
      SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, Mic, MicOff, Video, VideoOff,
      Monitor, Smartphone, Tablet, Laptop, Printer, Wifi, WifiOff, Bluetooth, Battery, BatteryCharging,
      Power, PowerOff, Zap, ZapOff, Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, Wind,
      Umbrella, Droplets, Thermometer, Navigation, Map, Globe, Flag, Shield, ShieldCheck, ShieldAlert,
      ShieldX, Key, Unlock, Database, Server, HardDrive, Cpu, MemoryStick, Mouse, Keyboard, Headphones,
      Speaker, Radio, Tv, Gamepad, Palette, Brush, PenTool, Type, Bold, Italic, Underline,
      Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Quote, Code, Terminal, Command,
      Slash, Hash, AtSign, DollarSign, Percent, Divide, Equal, Infinity,
      // Additional icons for MDI replacements
      Activity, Baby, Circle, Droplet, DropletOff, Flame, HelpCircle, PackageCheck, PlayCircle,
      Sparkles, Users, UserCircle, UserPlus, Wrench, Briefcase, Waves, CircleDot
    }
    
    Object.entries(icons).forEach(([name, component]) => {
      app.component(name, component)
    })
  }
} 