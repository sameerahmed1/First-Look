// lib/price-book.ts

export type PriceScenario = {
  name: string;
  low: number;
  high: number;
  unit: string; // e.g., "per job", "per sq ft", "per hour"
  description: string;
};

export type TradeCategory =
  | "Plumbing"
  | "Electrical"
  | "Drywall_Paint"
  | "Roofing"
  | "HVAC"
  | "Appliances"
  | "General"
  | "Carpentry"
  | "Flooring"
  | "Windows_Doors"
  | "Concrete_Masonry"
  | "Siding_Exterior"
  | "Water_Mold_Restoration"
  | "Insulation";

export const PRICE_BOOK: Record<TradeCategory, Record<string, PriceScenario>> = {
  Plumbing: {
    "Drain Clog (Sink/Tub)": {
      name: "Standard Drain Cleaning",
      low: 150,
      high: 450,
      unit: "flat rate",
      description: "Snaking a standard blockage. High end if hydro-jetting is required or main line access needed."
    },
    "Main Line Clog": {
      name: "Main Sewer Line Cleaning",
      low: 250,
      high: 650,
      unit: "flat rate",
      description: "Snaking or jetting main sewer line from cleanout. High end for root intrusion or camera inspection."
    },
    "Camera Inspection": {
      name: "Sewer Line Camera Diagnostic",
      low: 150,
      high: 400,
      unit: "per inspection",
      description: "Video inspection of drain/sewer lines to locate blockages, breaks, or root intrusion."
    },
    "Toilet Repair (Internal)": {
      name: "Toilet Mechanism Rebuild",
      low: 125,
      high: 275,
      unit: "per toilet",
      description: "Replacing flapper, fill valve, or flush valve. Wax ring seal is additional."
    },
    "Toilet Replacement": {
      name: "Toilet Remove & Replace",
      low: 300,
      high: 600,
      unit: "per toilet",
      description: "Labor to remove old and install new toilet. Does not include cost of toilet. High end for wall-mount or difficult access."
    },
    "Wax Ring Replacement": {
      name: "Toilet Wax Ring/Flange Repair",
      low: 150,
      high: 350,
      unit: "per toilet",
      description: "Pull toilet, replace wax ring, reset. High end if flange repair/replacement needed."
    },
    "Faucet Replacement": {
      name: "Faucet Install (Labor Only)",
      low: 175,
      high: 400,
      unit: "per fixture",
      description: "Swap out existing faucet. Higher cost for complex mounts, corroded pipes, or wall-mount faucets."
    },
    "Leak Repair (Accessible)": {
      name: "Minor Pipe Leak Repair",
      low: 175,
      high: 450,
      unit: "per leak",
      description: "Exposed pipe repair (under sink/basement). Does not include opening walls."
    },
    "Leak Repair (In Ceiling/Wall)": {
      name: "Concealed Leak Repair",
      low: 750,
      high: 2800,
      unit: "per job",
      description: "Includes cutting access. Drywall patch is separate. High end for slab leaks requiring jackhammer."
    },
    "Shutoff Valve Replacement": {
      name: "Supply Valve Swap",
      low: 150,
      high: 350,
      unit: "per valve",
      description: "Replacing angle stop or gate valve under sink/toilet. High end for corroded/seized valves."
    },
    "Water Heater Repair": {
      name: "Water Heater Component Fix",
      low: 175,
      high: 900,
      unit: "per job",
      description: "Thermostat, element, or anode rod replacement. Tank leaks usually require full replacement."
    },
    "Water Heater Replacement (Tank)": {
      name: "Tank Water Heater Install",
      low: 1200,
      high: 2500,
      unit: "per unit",
      description: "Labor + standard 40-50 gal tank. High end for difficult access, permit, or code upgrades."
    },
    "Water Heater Replacement (Tankless)": {
      name: "Tankless Water Heater Install",
      low: 2500,
      high: 5000,
      unit: "per unit",
      description: "Labor + unit. High end includes gas line upsizing or electrical upgrades."
    },
    "Garbage Disposal Install": {
      name: "Disposal Replacement",
      low: 225,
      high: 500,
      unit: "per unit",
      description: "Labor + standard unit. High end for premium brands, electrical mods, or septic-safe units."
    },
    "Sump Pump Replacement": {
      name: "Sump Pump Install/Replace",
      low: 400,
      high: 1200,
      unit: "per pump",
      description: "Submersible pump replacement. High end for battery backup systems or new pit installation."
    },
    "Water Softener Install": {
      name: "Water Softener Setup",
      low: 400,
      high: 900,
      unit: "per unit",
      description: "Labor to install customer-provided softener. High end includes drain line routing and electrical."
    },
    "Hose Bib Repair/Replace": {
      name: "Outdoor Faucet Fix",
      low: 150,
      high: 400,
      unit: "per faucet",
      description: "Replacing leaky or frozen hose bib. High end for frost-free installation through wall."
    },
    "P-Trap Replacement": {
      name: "Drain Trap Swap",
      low: 100,
      high: 225,
      unit: "per trap",
      description: "Replacing corroded or leaking P-trap under sink. Includes minimum service call."
    },
    "Shower Cartridge Replacement": {
      name: "Shower Valve Cartridge Swap",
      low: 200,
      high: 450,
      unit: "per shower",
      description: "Replace shower cartridge to fix dripping/temperature issues. Includes basic trim removal and reset; does not include full valve replacement behind wall or tile repair."
    },
    "Shower Valve Replacement (Behind Wall)": {
      name: "Shower Mixing Valve Replace",
      low: 750,
      high: 1800,
      unit: "per valve",
      description: "Replace full shower valve body in wall. Price depends on access (drywall vs tile), pipe type, and whether patch/finish is included."
    },
    "Main Water Line Repair (Small Dig)": {
      name: "Underground Water Line Repair",
      low: 400,
      high: 1500,
      unit: "per repair",
      description: "Repair a localized leak in the main water/service line. High end for difficult access, deeper trenching, landscaping/driveway restoration, or multiple breaks."
    },
    "Main Water Line Replacement": {
      name: "Service Line Replacement",
      low: 50,
      high: 150,
      unit: "per linear ft",
      description: "Replace main water/service line to house. Per-foot pricing varies by depth, material, meter connection, and restoration (concrete/landscaping)."
    },
    "Sewer Line Replacement (Trenchless)": {
      name: "Trenchless Sewer Line Replace/Line",
      low: 1900,
      high: 6000,
      unit: "per job",
      description: "Trenchless sewer line replacement or lining for typical residential run. High end for longer runs, deeper lines, permits, and cleanout work."
    },
    "Hydro Jetting (Main Line)": {
      name: "Hydro-Jet Drain Cleaning",
      low: 300,
      high: 800,
      unit: "per job",
      description: "High-pressure cleaning for grease/roots in main line. Often preceded by camera inspection; severe root intrusion or collapsed pipe is separate."
    }
  },
  Electrical: {
    "Outlet/Switch Repair": {
      name: "Device Troubleshooting/Swap",
      low: 125,
      high: 275,
      unit: "per visit",
      description: "Fixing a dead outlet or replacing a switch. Includes minimum service call."
    },
    "Outlet Addition": {
      name: "New Outlet Installation",
      low: 200,
      high: 500,
      unit: "per outlet",
      description: "Running new circuit or extending existing. High end for finished walls or long runs."
    },
    "GFCI Outlet Install": {
      name: "GFCI Outlet Upgrade",
      low: 150,
      high: 300,
      unit: "per outlet",
      description: "Installing ground-fault protection in kitchens, baths, exteriors. Required by code near water."
    },
    "USB Outlet Install": {
      name: "USB Outlet Upgrade",
      low: 125,
      high: 225,
      unit: "per outlet",
      description: "Replacing standard outlet with USB-integrated version."
    },
    "Light Fixture Install": {
      name: "Standard Fixture Swap",
      low: 125,
      high: 350,
      unit: "per fixture",
      description: "Replacing existing light. High end for chandeliers, high ceilings, or heavy fixtures."
    },
    "Recessed Light Install": {
      name: "Can Light Installation",
      low: 175,
      high: 400,
      unit: "per light",
      description: "New construction or remodel cans. High end for insulated ceilings or finished attics."
    },
    "Ceiling Fan Install": {
      name: "Fan Installation",
      low: 175,
      high: 450,
      unit: "per fan",
      description: "Assumes box is fan-rated. High end if new wiring, box upgrade, or high ceiling."
    },
    "Breaker Replacement": {
      name: "Circuit Breaker Swap",
      low: 175,
      high: 350,
      unit: "per breaker",
      description: "Replacing a standard faulty breaker. Arc-fault (AFCI) or GFCI breakers cost more."
    },
    "Dedicated Circuit Install": {
      name: "New 20A/30A Circuit",
      low: 300,
      high: 700,
      unit: "per circuit",
      description: "Running new circuit from panel for appliance. High end for long runs or 240V."
    },
    "240V Outlet Install": {
      name: "Heavy-Duty Outlet (Dryer/Range)",
      low: 350,
      high: 750,
      unit: "per outlet",
      description: "New 240V circuit for dryer, range, or welder. Includes breaker and wiring."
    },
    "EV Charger Install": {
      name: "Electric Vehicle Charger Setup",
      low: 500,
      high: 1500,
      unit: "per install",
      description: "Level 2 charger installation (labor only). High end for panel upgrades or long runs."
    },
    "Panel Upgrade": {
      name: "Main Panel Upgrade (100A to 200A)",
      low: 2500,
      high: 5500,
      unit: "per job",
      description: "Full service change. High end includes utility coordination, weatherhead, and meter base."
    },
    "Subpanel Install": {
      name: "Subpanel Addition",
      low: 800,
      high: 2000,
      unit: "per panel",
      description: "Adding 60A-100A subpanel for garage, shop, or addition."
    },
    "Whole House Surge Protector": {
      name: "Surge Protection Install",
      low: 300,
      high: 600,
      unit: "per unit",
      description: "Panel-mounted surge suppressor. Protects all circuits from lightning/grid surges."
    },
    "Smoke/CO Detector (Hardwired)": {
      name: "Hardwired Detector Install",
      low: 100,
      high: 225,
      unit: "per detector",
      description: "Installing or replacing hardwired smoke/CO detector. Interconnected units cost more."
    },
    "Doorbell/Ring Install": {
      name: "Video Doorbell Setup",
      low: 125,
      high: 300,
      unit: "per unit",
      description: "Installing wired video doorbell. High end if new transformer or wiring needed."
    },
    "Bathroom Exhaust Fan": {
      name: "Bath Fan Replace/Install",
      low: 200,
      high: 500,
      unit: "per fan",
      description: "Replacing existing fan. High end for new install with duct routing to exterior."
    },
    "Electrical Troubleshooting": {
      name: "Electrical Diagnostic & Troubleshoot",
      low: 150,
      high: 450,
      unit: "per visit",
      description: "Diagnose intermittent power, tripping breakers, flickering lights, or dead circuits. Repair work (parts/labor) billed separately once cause is confirmed."
    },
    "Generator Transfer Switch Install": {
      name: "Transfer Switch / Interlock Install",
      low: 900,
      high: 2500,
      unit: "per install",
      description: "Install transfer switch or interlock kit for portable generator. Includes wiring and labeling; generator inlet/outlet and permits may be additional."
    },
    "Attic/Outdoor GFCI Troubleshoot": {
      name: "GFCI Circuit Troubleshoot",
      low: 125,
      high: 350,
      unit: "per visit",
      description: "Find and resolve nuisance trips on GFCI circuits (bath/garage/outdoor). High end if multiple downstream devices or moisture intrusion."
    }
  },
  Drywall_Paint: {
    "Small Hole Patch": {
      name: "Doorknob/Nail Hole Patch",
      low: 100,
      high: 225,
      unit: "per patch",
      description: "Patch, sand, and spot prime. Paint matching is extra. Minimum charge applies."
    },
    "Medium Wall Repair": {
      name: "Section Repair (Up to 4x4)",
      low: 275,
      high: 550,
      unit: "per section",
      description: "Cut out damage, new drywall, tape, mud, texture match."
    },
    "Large Wall Repair": {
      name: "Section Repair (4x4 to 8x8)",
      low: 400,
      high: 900,
      unit: "per section",
      description: "Larger cutout repairs. May require additional coats and blending."
    },
    "Water Damage Repair": {
      name: "Water Stain/Damage Fix",
      low: 550,
      high: 1600,
      unit: "per area",
      description: "Cut out wet rock, check insulation, seal stain, patch. High end for ceiling work or mold remediation."
    },
    "Ceiling Repair": {
      name: "Ceiling Crack/Sag Repair",
      low: 450,
      high: 1400,
      unit: "per ceiling",
      description: "More labor intensive than walls due to gravity and texture matching. Scaffolding may be needed."
    },
    "Popcorn Ceiling Removal": {
      name: "Acoustic Texture Removal",
      low: 2,
      high: 5,
      unit: "per sq ft",
      description: "Scrape, skim coat, and prep for paint. High end if asbestos testing/abatement required."
    },
    "Texture Matching": {
      name: "Wall/Ceiling Texture Match",
      low: 200,
      high: 500,
      unit: "per area",
      description: "Matching existing knockdown, orange peel, or skip trowel texture."
    },
    "Room Painting (Interior)": {
      name: "Paint Single Room (Walls Only)",
      low: 350,
      high: 700,
      unit: "per room",
      description: "Standard 10x12 room, 2 coats. High end includes trim, doors, or color change requiring primer."
    },
    "Whole House Interior Paint": {
      name: "Full Interior Repaint",
      low: 3,
      high: 6,
      unit: "per sq ft",
      description: "Walls and ceilings, 2 coats. Based on floor square footage. Trim/doors extra."
    },
    "Exterior Painting": {
      name: "Exterior House Paint",
      low: 3,
      high: 7,
      unit: "per sq ft",
      description: "Siding, trim, and fascia. Based on paintable surface area. Includes prep and prime."
    },
    "Cabinet Painting": {
      name: "Kitchen Cabinet Refinish",
      low: 70,
      high: 190,
      unit: "per door/drawer",
      description: "Per door/drawer front only (faces). Includes prep, prime, and sprayed or fine-rolled finish. Does not include cabinet box interiors/exteriors or major repairs; those are separate line items."
    },
    "Trim/Baseboard Paint": {
      name: "Trim and Baseboard Painting",
      low: 2,
      high: 4,
      unit: "per linear ft",
      description: "Painting baseboards, door casings, crown molding."
    },
    "Drywall Install & Finish (Sheet)": {
      name: "Hang, Tape, Mud, Sand",
      low: 120,
      high: 250,
      unit: "per sheet (4x8)",
      description: "Install new drywall and finish to paint-ready (hang, tape, mud, sand). Does not include paint/texture unless added as separate line items."
    },
    "Wallpaper Removal": {
      name: "Wallpaper Strip & Wall Prep",
      low: 2,
      high: 5,
      unit: "per sq ft",
      description: "Remove wallpaper and prep surface (wash, skim if needed). High end for multiple layers, heavy glue, or damaged drywall requiring skim coat."
    }
  },
  Roofing: {
    "Shingle Repair (Minor)": {
      name: "Minor Shingle Patch/Replace",
      low: 350,
      high: 800,
      unit: "flat rate",
      description: "Replacing <10 shingles or resealing loose shingles. Minimum call-out fee applies."
    },
    "Shingle Repair (Storm Damage)": {
      name: "Storm Damage Shingle Repair",
      low: 500,
      high: 2000,
      unit: "per area",
      description: "Replacing wind-damaged or missing shingles across roof section. May require felt replacement."
    },
    "Flashing Repair": {
      name: "Chimney/Vent Flashing Fix",
      low: 450,
      high: 1200,
      unit: "per area",
      description: "Resealing or replacing metal flashing around penetrations. Common leak source."
    },
    "Pipe Boot Replacement": {
      name: "Vent Pipe Boot Repair",
      low: 200,
      high: 450,
      unit: "per boot",
      description: "Replacing cracked rubber boot around plumbing vents. Common cause of leaks."
    },
    "Leak Diagnostic": {
      name: "Roof Leak Trace & Repair",
      low: 250,
      high: 850,
      unit: "per leak",
      description: "Locate source of leak and perform a minor repair (sealant/boot/flashing touch-up). High end for difficult access, multiple test cuts, or removing/reinstalling shingles. Larger repairs billed separately."
    },
    "Valley Repair": {
      name: "Roof Valley Reseal/Replace",
      low: 500,
      high: 1500,
      unit: "per valley",
      description: "Repairing or replacing valley metal and shingles in high-wear areas."
    },
    "Ridge Cap Repair": {
      name: "Ridge Cap Replacement",
      low: 400,
      high: 900,
      unit: "per section",
      description: "Replacing blown-off or deteriorated ridge cap shingles."
    },
    "Gutter Repair": {
      name: "Gutter Section Repair",
      low: 150,
      high: 400,
      unit: "per section",
      description: "Resealing seams, replacing hangers, or patching holes. Up to 10 linear feet."
    },
    "Gutter Installation": {
      name: "Seamless Gutter Install",
      low: 10,
      high: 20,
      unit: "per linear ft",
      description: "Seamless aluminum gutters installed, including hangers and typical downspouts. High end for tall/steep access, multiple stories, or add-ons like gutter guards; copper priced separately."
    },
    "Downspout Repair/Replace": {
      name: "Downspout Work",
      low: 100,
      high: 300,
      unit: "per downspout",
      description: "Replacing or rerouting damaged downspouts including extensions."
    },
    "Soffit/Fascia Repair": {
      name: "Soffit or Fascia Section Repair",
      low: 300,
      high: 800,
      unit: "per section",
      description: "Replacing rotted or damaged soffit/fascia boards. Up to 10 linear feet."
    },
    "Skylight Repair": {
      name: "Skylight Leak/Seal Repair",
      low: 400,
      high: 1200,
      unit: "per skylight",
      description: "Resealing flashing, replacing gaskets, or fixing condensation issues."
    },
    "Asphalt Replacement": {
      name: "Asphalt Shingle Replacement",
      low: 550,
      high: 1100,
      unit: "per square (100 sq ft)",
      description: "Full asphalt shingle replacement per roofing square (100 sq ft of roof surface), including tear-off, underlayment, and shingles. Low end for simple 1-story/low pitch; high end for steep pitch, multiple layers, complex valleys, or higher-grade shingles."
    },
    "Flat Roof Repair": {
      name: "Low-Slope/Flat Roof Patch",
      low: 400,
      high: 1000,
      unit: "per repair",
      description: "Patching TPO, EPDM, or modified bitumen roofing. High end for larger areas."
    },
    "Roof Inspection (No Repair)": {
      name: "Roof Inspection / Report",
      low: 150,
      high: 450,
      unit: "per inspection",
      description: "Inspection only with notes/photos. Price varies by roof height, pitch, and inspection method (walkable vs drone/infrared)."
    },
    "Gutter Cleaning": {
      name: "Clean Gutters & Flush Downspouts",
      low: 125,
      high: 350,
      unit: "per job",
      description: "Clean gutters and flush downspouts for typical single-family home. High end for multi-story homes, heavy debris, or guards removal/reinstall."
    },
    "Roof Decking Repair": {
      name: "Replace Damaged Roof Decking",
      low: 250,
      high: 900,
      unit: "per area",
      description: "Replace small sections of rotten/damaged decking discovered during repair/re-roof. Pricing depends on access and shingle type; area is typically a few sq ft."
    }
  },
  HVAC: {
    "Diagnostic Visit": {
      name: "Service Call / Diagnostic",
      low: 100,
      high: 200,
      unit: "per visit",
      description: "Trip charge to identify the issue. Often credited toward repair."
    },
    "Capacitor Replacement": {
      name: "Run/Start Capacitor Swap",
      low: 175,
      high: 400,
      unit: "per unit",
      description: "Common failure on AC compressors and fan motors. Quick fix with markup on part."
    },
    "Contactor Replacement": {
      name: "AC Contactor Swap",
      low: 175,
      high: 350,
      unit: "per unit",
      description: "Replacing worn contactor that controls compressor power."
    },
    "Blower Motor": {
      name: "Blower Motor Replacement",
      low: 500,
      high: 1600,
      unit: "per motor",
      description: "High end for ECM (variable speed) motors. Includes capacitor if needed."
    },
    "Inducer Motor": {
      name: "Draft Inducer Motor Replace",
      low: 400,
      high: 900,
      unit: "per motor",
      description: "Furnace inducer motor replacement. Common failure point on gas furnaces."
    },
    "Igniter Replacement": {
      name: "Furnace Igniter Swap",
      low: 175,
      high: 400,
      unit: "per unit",
      description: "Hot surface igniter or flame sensor replacement. Common no-heat cause."
    },
    "Flame Sensor Cleaning": {
      name: "Flame Sensor Service",
      low: 100,
      high: 200,
      unit: "per visit",
      description: "Cleaning dirty flame sensor causing short cycling. Quick fix."
    },
    "Refrigerant Charge": {
      name: "Leak Search & Recharge",
      low: 450,
      high: 1600,
      unit: "per system",
      description: "Leak search/diagnostic plus refrigerant recharge. Cost varies by refrigerant type and pounds added; major leak repair or coil replacement not included. Typical range covers small top-off through larger recharges on 3–5 ton systems."
    },
    "Evaporator Coil Cleaning": {
      name: "Indoor Coil Clean",
      low: 200,
      high: 500,
      unit: "per system",
      description: "Chemical cleaning of evaporator coil. Access dependent."
    },
    "Condenser Coil Cleaning": {
      name: "Outdoor Coil Clean",
      low: 125,
      high: 275,
      unit: "per unit",
      description: "Cleaning outdoor condenser coils for efficiency."
    },
    "Thermostat Install": {
      name: "Thermostat Replacement",
      low: 125,
      high: 350,
      unit: "per unit",
      description: "Installing programmable or smart thermostat. High end if new wiring (C-wire) needed."
    },
    "Condensate Drain Clear": {
      name: "AC Drain Line Service",
      low: 125,
      high: 275,
      unit: "per system",
      description: "Clearing clogged condensate drain line. Common cause of water leaks and shutoffs."
    },
    "Condensate Pump Replace": {
      name: "Condensate Pump Install",
      low: 200,
      high: 450,
      unit: "per pump",
      description: "Replacing failed condensate pump where gravity drain isn't possible."
    },
    "Ductwork Repair": {
      name: "Duct Sealing/Repair",
      low: 300,
      high: 800,
      unit: "per section",
      description: "Sealing leaky ducts or repairing disconnected/damaged sections."
    },
    "Filter Replacement (Difficult Access)": {
      name: "Filter Change (Hard to Reach)",
      low: 75,
      high: 150,
      unit: "per visit",
      description: "Replacing filters in difficult locations (attic, crawl). Standard filters are DIY."
    },
    "AC Condenser Replacement": {
      name: "Outdoor Condensing Unit Replace",
      low: 2500,
      high: 5000,
      unit: "per unit",
      description: "Replace outdoor AC condenser. Price varies by tonnage, brand/efficiency, refrigerant type, and permit requirements."
    },
    "Furnace Replacement": {
      name: "Furnace Replace (Like-for-like)",
      low: 2800,
      high: 7000,
      unit: "per unit",
      description: "Replace furnace with comparable size/efficiency using existing ducting/venting where possible. High end for high-efficiency units, venting changes, permits, or tight attic/crawl access."
    },
    "Mini-Split Install (Single Zone)": {
      name: "Ductless Mini-Split Install",
      low: 2000,
      high: 7000,
      unit: "per system",
      description: "Install single-zone ductless mini-split (one indoor head). High end for long line sets, difficult electrical runs, or premium equipment."
    },
    "Compressor Replacement": {
      name: "AC Compressor Replace",
      low: 800,
      high: 2300,
      unit: "per unit",
      description: "Replace AC compressor (parts + labor). High end if system requires additional refrigerant work, acid cleanup, or hard-start components."
    },
    "Evaporator Coil Replacement": {
      name: "Indoor Coil Replacement",
      low: 700,
      high: 2500,
      unit: "per coil",
      description: "Replace evaporator coil (typical leak repair). Price varies by coil type, refrigerant handling, and duct/line-set modifications."
    }
  },
  Appliances: {
    "Washing Machine Repair": {
      name: "Washer Pump/Belt Fix",
      low: 175,
      high: 450,
      unit: "per job",
      description: "Pump, belt, or lid switch replacement. Board or bearing repairs cost more."
    },
    "Washer Drain Issue": {
      name: "Washer Drain/Pump Service",
      low: 150,
      high: 350,
      unit: "per job",
      description: "Clearing drain pump, checking drain hose, or replacing pump."
    },
    "Dryer Repair": {
      name: "Dryer Heating Element/Belt",
      low: 175,
      high: 400,
      unit: "per job",
      description: "Element, thermal fuse, or belt replacement. Vent cleaning is separate."
    },
    "Dryer Vent Cleaning": {
      name: "Dryer Vent Service",
      low: 125,
      high: 250,
      unit: "per vent",
      description: "Cleaning lint buildup from dryer vent. Critical for fire prevention."
    },
    "Dryer Vent Install/Reroute": {
      name: "Dryer Vent Modification",
      low: 200,
      high: 500,
      unit: "per job",
      description: "Installing new vent or rerouting existing. High end for roof termination."
    },
    "Refrigerator Repair": {
      name: "Fridge Fan/Thermostat Fix",
      low: 225,
      high: 550,
      unit: "per job",
      description: "Evaporator fan, relay start, or thermostat. Compressor failure often totals the unit."
    },
    "Refrigerator Ice Maker": {
      name: "Ice Maker Repair/Replace",
      low: 175,
      high: 400,
      unit: "per job",
      description: "Ice maker module replacement or water inlet valve. Includes diagnostics."
    },
    "Refrigerator Water Line": {
      name: "Fridge Water Line Install",
      low: 150,
      high: 350,
      unit: "per line",
      description: "Running new water supply line to refrigerator for ice maker/dispenser."
    },
    "Dishwasher Repair": {
      name: "Dishwasher Pump/Valve",
      low: 175,
      high: 400,
      unit: "per job",
      description: "Drain pump, inlet valve, or spray arm replacement."
    },
    "Dishwasher Install": {
      name: "Dishwasher Replacement",
      low: 200,
      high: 450,
      unit: "per unit",
      description: "Labor to remove old and install new dishwasher. High end for granite countertop or raised floor."
    },
    "Range/Oven Repair (Electric)": {
      name: "Electric Range Element/Control",
      low: 175,
      high: 450,
      unit: "per job",
      description: "Burner element, igniter, or control board replacement."
    },
    "Range/Oven Repair (Gas)": {
      name: "Gas Range Igniter/Valve",
      low: 200,
      high: 500,
      unit: "per job",
      description: "Igniter, gas valve, or thermostat. Licensed gas work required."
    },
    "Microwave Install (OTR)": {
      name: "Over-Range Microwave Install",
      low: 150,
      high: 350,
      unit: "per unit",
      description: "Mounting over-the-range microwave. Includes bracket install and electrical."
    },
    "Garbage Disposal Repair": {
      name: "Disposal Reset/Jam Clear",
      low: 100,
      high: 200,
      unit: "per visit",
      description: "Clearing jams, resetting unit, or minor repairs. Replacement may be more economical."
    },
    "Water Heater Not Heating (Electric)": {
      name: "Electric Water Heater Diagnostic",
      low: 125,
      high: 250,
      unit: "per visit",
      description: "Diagnose no-hot-water on electric water heater (elements/thermostats). Parts and repair labor billed separately; replacement is separate line item."
    }
  },
  General: {
    "Handyman Hourly": {
      name: "General Handyman Labor",
      low: 75,
      high: 150,
      unit: "per hour",
      description: "For miscellaneous tasks not requiring a trade license. 2-hour minimum typical."
    },
    "Emergency Callout": {
      name: "After-Hours / Emergency Fee",
      low: 200,
      high: 500,
      unit: "flat fee",
      description: "Surcharge for nights, weekends, and holidays. Added to repair cost."
    },
    "Service Call (Minimum)": {
      name: "Trip Charge / Minimum Fee",
      low: 75,
      high: 150,
      unit: "flat fee",
      description: "Minimum charge for showing up. Usually credited toward work performed."
    },
    "Permit Fee Handling": {
      name: "Permit Procurement",
      low: 100,
      high: 300,
      unit: "per permit",
      description: "Handling permit paperwork and inspection coordination. Permit fee itself is separate."
    },
    "Caulking/Weatherstripping": {
      name: "Seal Doors/Windows",
      low: 100,
      high: 300,
      unit: "per area",
      description: "Replacing worn caulk or weatherstripping around doors and windows."
    },
    "Pressure Washing": {
      name: "Power Wash Surfaces",
      low: 150,
      high: 400,
      unit: "per job",
      description: "Cleaning driveway, deck, siding, or patio. Based on area size."
    },
    "TV Mounting": {
      name: "TV Mount (Standard Stud Wall)",
      low: 125,
      high: 300,
      unit: "per TV",
      description: "Mount TV on stud wall with basic cable concealment on surface. In-wall concealment, masonry mounting, or soundbar adds cost."
    },
    "Furniture Assembly": {
      name: "Furniture Assembly",
      low: 100,
      high: 300,
      unit: "per item",
      description: "Assemble flat-pack furniture (bed, dresser, desk). High end for large multi-piece items or complex hardware."
    }
  },
  Carpentry: {
    "Door Adjustment": {
      name: "Interior Door Tune-Up",
      low: 100,
      high: 250,
      unit: "per door",
      description: "Fixing sticking, sagging, or latching issues. Planing, hinge adjustment, strike plate work."
    },
    "Interior Door Install": {
      name: "Prehung Interior Door Install",
      low: 200,
      high: 450,
      unit: "per door",
      description: "Installing new prehung door in existing opening. High end for solid core or custom sizes."
    },
    "Exterior Door Install": {
      name: "Entry Door Replacement",
      low: 400,
      high: 1000,
      unit: "per door",
      description: "Labor to install exterior prehung door. High end for steel/fiberglass or weatherproofing challenges."
    },
    "Door Hardware Install": {
      name: "Lockset/Deadbolt Install",
      low: 75,
      high: 200,
      unit: "per lock",
      description: "Installing new door hardware. High end for smart locks or new bore holes."
    },
    "Baseboard/Trim Repair": {
      name: "Trim Repair/Replace",
      low: 150,
      high: 400,
      unit: "per section",
      description: "Repairing or replacing damaged baseboards, door casing, or crown molding."
    },
    "Baseboard Install": {
      name: "Baseboard Installation",
      low: 4,
      high: 10,
      unit: "per linear ft",
      description: "Installing new baseboards. Price varies by material and profile complexity."
    },
    "Deck Board Replacement": {
      name: "Deck Board Repair",
      low: 200,
      high: 600,
      unit: "per section",
      description: "Replacing rotted or damaged deck boards. Up to 20 sq ft."
    },
    "Deck Railing Repair": {
      name: "Railing Section Repair",
      low: 200,
      high: 500,
      unit: "per section",
      description: "Repairing or replacing damaged deck railing sections."
    },
    "Fence Repair": {
      name: "Fence Section Repair",
      low: 200,
      high: 600,
      unit: "per section",
      description: "Replacing damaged fence boards, rails, or posts. Up to 8 ft section."
    },
    "Fence Post Replacement": {
      name: "Fence Post Repair",
      low: 150,
      high: 400,
      unit: "per post",
      description: "Replacing rotted or broken fence post. Includes concrete setting."
    },
    "Gate Repair": {
      name: "Gate Adjustment/Repair",
      low: 150,
      high: 400,
      unit: "per gate",
      description: "Fixing sagging gate, replacing hardware, or realigning."
    },
    "Shelf Install": {
      name: "Floating Shelf Mount",
      low: 75,
      high: 200,
      unit: "per shelf",
      description: "Installing floating shelves or brackets. Price per shelf."
    },
    "Closet Rod/Shelf": {
      name: "Closet Organization Install",
      low: 150,
      high: 400,
      unit: "per closet",
      description: "Installing standard rod and shelf system. Wire or wood systems."
    },
    "Subfloor Repair": {
      name: "Subfloor Section Repair",
      low: 300,
      high: 800,
      unit: "per section",
      description: "Replacing rotted or water-damaged subfloor. Up to 4x8 sheet."
    },
    "Stair Tread Repair": {
      name: "Stair Tread Replace",
      low: 150,
      high: 400,
      unit: "per tread",
      description: "Replacing worn or damaged stair treads. High end for hardwood matching."
    },
    "Dry Rot Repair (Small)": {
      name: "Trim/Sill Rot Repair",
      low: 250,
      high: 900,
      unit: "per area",
      description: "Remove and replace localized rotted wood on exterior trim/sills. High end for ladder work, painting, or hidden framing damage."
    },
    "Handrail Install": {
      name: "Handrail Install",
      low: 150,
      high: 450,
      unit: "per section",
      description: "Install interior or exterior handrail section. High end for custom rails, masonry anchors, or code-required returns."
    }
  },
  Flooring: {
    "Hardwood Repair (Patch)": {
      name: "Hardwood Floor Patch",
      low: 300,
      high: 700,
      unit: "per area",
      description: "Replacing damaged boards and blending finish. Up to 10 sq ft."
    },
    "Hardwood Refinish": {
      name: "Hardwood Floor Refinishing",
      low: 4,
      high: 8,
      unit: "per sq ft",
      description: "Sand, stain, and finish existing hardwood floors."
    },
    "Laminate Repair": {
      name: "Laminate Floor Repair",
      low: 200,
      high: 500,
      unit: "per area",
      description: "Replacing damaged laminate planks. Matching discontinued patterns may be difficult."
    },
    "Tile Repair": {
      name: "Tile Replace (Few Tiles)",
      low: 200,
      high: 500,
      unit: "per area",
      description: "Replacing cracked or chipped tiles. High end if subfloor repair needed."
    },
    "Grout Repair": {
      name: "Grout Restoration",
      low: 3,
      high: 8,
      unit: "per sq ft",
      description: "Cleaning, regrouting, or sealing existing tile grout."
    },
    "Vinyl Repair": {
      name: "Sheet Vinyl Patch",
      low: 150,
      high: 400,
      unit: "per patch",
      description: "Patching or seaming damaged sheet vinyl. Match may not be perfect."
    },
    "LVP/LVT Repair": {
      name: "Luxury Vinyl Plank Repair",
      low: 200,
      high: 450,
      unit: "per area",
      description: "Replacing damaged luxury vinyl planks. Requires lifting adjacent planks."
    },
    "Carpet Repair": {
      name: "Carpet Patch/Seam Repair",
      low: 150,
      high: 400,
      unit: "per repair",
      description: "Patching holes, burns, or separated seams. Donor carpet may be needed."
    },
    "Carpet Stretch": {
      name: "Carpet Re-Stretch",
      low: 150,
      high: 400,
      unit: "per room",
      description: "Stretching loose or buckled carpet. Standard room size."
    },
    "Threshold Install": {
      name: "Transition Strip Install",
      low: 75,
      high: 200,
      unit: "per threshold",
      description: "Installing transition between different flooring types."
    },
    "Squeaky Floor Fix": {
      name: "Floor Squeak Repair",
      low: 150,
      high: 400,
      unit: "per area",
      description: "Securing loose subfloor from above or below. Access dependent."
    },
    "LVP Installation": {
      name: "Luxury Vinyl Plank Install",
      low: 3,
      high: 8,
      unit: "per sq ft",
      description: "Install LVP/LVT flooring (labor + typical underlayment). High end for subfloor prep, stairs, or complex layout; materials quality varies."
    },
    "Tile Installation": {
      name: "Tile Floor Install",
      low: 12,
      high: 22,
      unit: "per sq ft",
      description: "Install tile floor including thinset and grout. High end for large-format tile, pattern layout, membrane systems, or extensive floor leveling."
    },
    "Carpet Installation": {
      name: "Carpet Install",
      low: 3,
      high: 11,
      unit: "per sq ft",
      description: "Install carpet including basic labor; padding, tear-out, stairs, and furniture moving can add cost. Range varies by carpet grade and layout complexity."
    }
  },
  Windows_Doors: {
    "Window Glass Replacement": {
      name: "Single Pane Glass Replace",
      low: 150,
      high: 400,
      unit: "per pane",
      description: "Replacing broken single pane glass. Glazing and cleanup included."
    },
    "IGU Replacement": {
      name: "Double Pane Glass Unit",
      low: 300,
      high: 700,
      unit: "per window",
      description: "Replacing fogged or cracked insulated glass unit (IGU). Size dependent."
    },
    "Window Hardware Repair": {
      name: "Window Lock/Crank Repair",
      low: 100,
      high: 275,
      unit: "per window",
      description: "Replacing broken locks, cranks, or operators on casement/awning windows."
    },
    "Window Balance Replace": {
      name: "Sash Balance Repair",
      low: 125,
      high: 300,
      unit: "per window",
      description: "Replacing broken balances in double-hung windows that won't stay up."
    },
    "Window Screen Repair": {
      name: "Screen Re-Mesh",
      low: 50,
      high: 125,
      unit: "per screen",
      description: "Replacing torn screen mesh in existing frame."
    },
    "Storm Door Install": {
      name: "Storm Door Installation",
      low: 200,
      high: 450,
      unit: "per door",
      description: "Installing storm/screen door. High end for custom sizing or difficult jambs."
    },
    "Sliding Door Repair": {
      name: "Patio Door Roller/Track Fix",
      low: 175,
      high: 400,
      unit: "per door",
      description: "Replacing worn rollers or repairing damaged track on sliding glass doors."
    },
    "Sliding Door Screen": {
      name: "Patio Screen Door Repair",
      low: 100,
      high: 250,
      unit: "per screen",
      description: "Replacing or repairing sliding screen door and rollers."
    },
    "Weatherstripping Replace": {
      name: "Door/Window Weatherstrip",
      low: 75,
      high: 200,
      unit: "per opening",
      description: "Replacing worn weatherstripping on doors or windows."
    },
    "Door Sweep Install": {
      name: "Door Sweep Replacement",
      low: 50,
      high: 150,
      unit: "per door",
      description: "Installing or replacing bottom door sweep for air sealing."
    },
    "Garage Door Spring": {
      name: "Garage Door Spring Replace",
      low: 200,
      high: 450,
      unit: "per spring",
      description: "Torsion or extension spring replacement. DANGEROUS - not DIY."
    },
    "Garage Door Opener Repair": {
      name: "Opener Motor/Gear Fix",
      low: 175,
      high: 400,
      unit: "per job",
      description: "Repairing garage door opener motor, gears, or sensors."
    },
    "Garage Door Opener Install": {
      name: "Opener Replacement",
      low: 300,
      high: 600,
      unit: "per unit",
      description: "Labor to install new garage door opener. Includes programming and safety check."
    },
    "Window Replacement (Full Unit)": {
      name: "Full Window Replacement",
      low: 650,
      high: 1500,
      unit: "per window",
      description: "Replace full window unit (vinyl/standard sizes). High end for larger windows, tempered glass, custom sizing, trim repair, or multi-story access."
    }
  },
  Concrete_Masonry: {
    "Concrete Crack Seal (Minor)": {
      name: "Concrete Crack Sealing",
      low: 100,
      high: 300,
      unit: "per job",
      description: "Seal small cracks (typical minimum trip charge). Best for non-structural surface cracks; wider/deeper cracks may require routing and patching."
    },
    "Concrete Crack Seal (Per Linear Ft)": {
      name: "Concrete Crack Seal (Line Item)",
      low: 1,
      high: 4,
      unit: "per linear ft",
      description: "Line-item pricing for crack sealing beyond minimum. Includes prep/cleaning and sealant; very wide cracks or structural movement is separate."
    },
    "Concrete Driveway Repair (Patch/Resurface)": {
      name: "Concrete Patch/Resurface",
      low: 800,
      high: 3000,
      unit: "per job",
      description: "Patch spalls/cracks or resurface a section of driveway/walk. High end for larger areas, decorative finishes, or significant prep."
    },
    "Concrete Lifting (Mudjacking/Poly)": {
      name: "Lift Sunken Slab",
      low: 1500,
      high: 6000,
      unit: "per area",
      description: "Lift sunken concrete via mudjacking or polyurethane foam. Cost depends on slab size, access, and void conditions."
    },
    "Foundation Crack Injection": {
      name: "Foundation Crack Injection (Epoxy/Poly)",
      low: 250,
      high: 800,
      unit: "per crack",
      description: "Inject epoxy or polyurethane to seal a small foundation crack and stop water intrusion. Not for major structural movement or bowing walls."
    }
  },
  Siding_Exterior: {
    "Siding Repair (Small Patch)": {
      name: "Siding Patch Repair",
      low: 200,
      high: 900,
      unit: "per patch",
      description: "Repair/replace a small section of siding (typ. up to ~50 sq ft). Range varies by material (vinyl, fiber cement, wood) and access height."
    },
    "Siding Replacement (Vinyl)": {
      name: "Vinyl Siding Replacement",
      low: 3,
      high: 12,
      unit: "per sq ft",
      description: "Replace vinyl siding (installed). High end for tear-off, housewrap/insulation upgrades, and complex elevations."
    },
    "Exterior Trim Repair": {
      name: "Exterior Trim Repair/Replace",
      low: 250,
      high: 1200,
      unit: "per area",
      description: "Repair/replace exterior trim boards around windows/doors/corners. High end for rot repair behind trim, tall ladders, and paint."
    },
    "Fascia Board Replacement": {
      name: "Fascia Board Replace",
      low: 8,
      high: 20,
      unit: "per linear ft",
      description: "Replace fascia board (often discovered with gutter issues). High end for multi-story access or significant rot/framing repair."
    },
    "Exterior Caulk & Seal Package": {
      name: "Exterior Sealant Touch-up",
      low: 200,
      high: 600,
      unit: "per job",
      description: "Re-caulk common leak points (trim joints, penetrations) on a typical elevation. Not a substitute for flashing repairs when water is behind siding."
    }
  },
  Water_Mold_Restoration: {
    "Water Mitigation (Dry-Out)": {
      name: "Water Extraction & Drying",
      low: 3,
      high: 8,
      unit: "per sq ft",
      description: "Basic water mitigation and drying (extraction, air movers, dehumidification). Pricing depends on water category, material saturation, and drying days."
    },
    "Mold Remediation": {
      name: "Mold Remediation",
      low: 10,
      high: 25,
      unit: "per sq ft",
      description: "Containment + removal/cleaning of contaminated materials. Does not include rebuild (drywall/flooring) after remediation unless stated."
    },
    "Moisture/Mold Inspection": {
      name: "Moisture/Mold Inspection",
      low: 150,
      high: 400,
      unit: "per visit",
      description: "Moisture mapping and visual inspection; may include basic meter readings. Lab testing, air sampling, or full reports can add cost."
    },
    "Air Mover Rental": {
      name: "Air Mover Rental",
      low: 20,
      high: 50,
      unit: "per day",
      description: "Rental rate for a commercial air mover fan (drying). Often used in multiples; minimum rental periods may apply."
    },
    "Dehumidifier Rental (LGR)": {
      name: "LGR Dehumidifier Rental",
      low: 80,
      high: 150,
      unit: "per day",
      description: "Rental rate for an LGR dehumidifier used in restoration drying. Weekly rates can reduce daily average."
    }
  },
  Insulation: {
    "Attic Blown-In Insulation": {
      name: "Blown-In Attic Insulation",
      low: 1,
      high: 3,
      unit: "per sq ft",
      description: "Add blown-in insulation to attic (fiberglass or cellulose). Range varies by R-value target, access, and prep work (baffles, air sealing)."
    },
    "Attic Air Sealing": {
      name: "Attic Air Sealing",
      low: 500,
      high: 1500,
      unit: "per attic",
      description: "Seal common attic air leaks (top plates, penetrations, chases). Often bundled with new insulation for best performance."
    },
    "Insulate Attic Hatch": {
      name: "Attic Hatch/Access Insulation",
      low: 150,
      high: 400,
      unit: "per opening",
      description: "Add insulated cover and weatherseal to attic access hatch or pull-down stairs."
    }
  }
};
