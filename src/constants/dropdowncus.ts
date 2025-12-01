// Ultra-compressed industry list
const INDUSTRY_TYPE_OPTIONS = 'Automobile Manufacturing|Automotive|Electric Vehicles (EVs)|Automotive Parts Manufacturing|Railways|Transport & Logistics|Road Freight & Trucking|Rail Freight Services|Air Cargo Services|Ocean Shipping & Freight|Courier & Parcel Delivery|Warehousing & Storage|Cold Chain Logistics|Freight Forwarding|Supply Chain Management|Last-Mile Delivery Services|Electronics Manufacturing|Textile & Apparel Manufacturing|Pharmaceutical Manufacturing|Food & Beverage Manufacturing|Chemical Manufacturing|Plastic & Rubber Products Manufacturing|Machinery & Equipment Manufacturing|Furniture Manufacturing|Metal Fabrication & Foundry|Ceramics|Chemicals - Organic|Chemicals - Inorganic|Cold Storage|Electrical Goods / Components|Engineering & Capital Goods|Fertilizer Manufacturing|Industrial Automation|Industrial Chemicals|Iron & Steel|Logistics & Supply Chain|Lubricants / Oils / Greases|Machine Tools|Marble & Natural Stone|Medical Devices & Instruments|Metal Fabrication|Rubber & Rubber Products|Safety & Protective Equipment|Steel & Iron Foundries|Textiles (Wool, Cotton, Synthetic)|Wood & Timber Products|Ceramic Tiles|Precision Engineering|Rubber Chemicals|Timber Packaging|Tyres & Tubes|Wood Furniture|Fertilizers & Pesticides|Packaging / Packaging Materials|Petrochemicals|Pharmaceuticals|Photovoltaics / Solar Panels|Chemical Distribution|Petrochemical Derivatives|Pharmaceuticals - Generic & Branded|Distributors & Dealers|Wholesale Trade|Retail (Brick & Mortar)|Non-woven Fabrics|Packaging Machinery|Aromatics / Essential Oils|Oil & Gas|Aviation|Export / Import Trade|Import-Export Logistics|Import-Export Companies|Packaged Foods|Food Processing|Glass Manufacturing|Robotics Manufacturing|Automation Industry|Agriculture|Agrochemicals / Pesticides|Animal Husbandry|Aquaculture|Apiculture (Beekeeping)|Aromatics/Essential Oils|Apparels and Garments|Appliances/Home Appliances|Architecture / Building Design|Artificial Leather/Synthetic Leather|Biotech / Biotechnology|Cement|Clean Energy / Renewable Energy|Cloud Computing/Data Centers|Coal Mining|Communications/Telecom|Computer Hardware|Construction / Infrastructure|Consumer Electronics|Consumer Goods - Durable|Consumer Goods - Non-Durable|Consulting Services|Cosmetics & Beauty Products|Defence & Aerospace|Design & Creative Services|Dairy|Education & Training|Electronics Manufacturing|Entertainment & Media|Farming/Crop Production|Finance & Financial Services|Consumer Electronics Retail|Fashion & Apparel Retail|Grocery & Supermarkets|Automotive Dealerships|Pharmacy Retail Chains|Specialty Stores (Jewelry, Sports)|Hospitals & Clinics|Medical Devices & Equipment|Pharmaceutical Retail|Fitness Centers & Gyms|Translating/Localization Services|UAV / Drone Manufacturing|Vegetable & Fruit Processing|Veterinary Products|Vitamins & Nutraceuticals|Waste to Energy Plants|Water Bottling|Wearables / Smart Wearables|Wind Energy Devices|Women & Children Products (Clothing, Toys, etc)|Yoga & Wellness Products|Zero-waste / Sustainable Products|Zoology/Animal Products|Zoos / Wildlife Parks / Conservation Tourism|3D Printing / Additive Manufacturing|Electric Appliances Repair / After-sales Support|Robotics mfg|Public Transportation|Public Utilities (Water, Electricity, Gas)|Poultry Farming|Power Generation / Thermal Plants|Recycling & Waste Management|Renewable Energy (Solar, Wind, Hydro)|Restaurants / Food Service|Retail Trade|Salt Production|Seafood / Marine Products|Seeds / Nursery|Semiconductors|Shipping & Ports|Soap & Detergents|Solar Energy Systems|Sports Goods & Equipment|Sugar Industry|Tobacco Products|Tourism & Travel|Toys & Games|TV & Film Production|Wastepaper & Recycling|Water Treatment & Purification|Wellness & Spa|Window & Door Manufacturing|Coal & Lignite|Dry Fruits / Nuts Processing|Footwear|Gems Cutting/Polishing|Handicrafts/Art & Crafts|Hemp/Natural Fibers|Ice Manufacturing|Inks & Pigments|Labelling & Tags|Laundry & Cleaning Services|Leather Tanning|Load Balancing & Cloud Infrastructure|Consumer Services|Beauty Salons & Personal Care|Cleaning Services|Security Services|Childcare & Daycare Services|Funeral Services|Non-Profit Organizations|Government Services|Telecommunications|Research & Development|Sports & Recreation|Printing & Packaging|Environmental Services|Hospitality Supplies & Equipment|Luxury Goods|Marine Fisheries|Meat Processing|Modular Homes / Prefab Construction|Natural Cosmetics / Organic Beauty|Nuclear Energy|Oxygen Manufacturing/Medical Gases|Paper Products (Stationery, etc)|Pickles / Chutneys/Sauces|Printing Inks and Printing Services|Real-Estate Management & Rentals|Renewable Fuels (Biofuels)|Road Construction & Highways|Sanitary Products (napkins, diapers etc)|Seafood Canning & Packaging|Security / Alarm Systems|Seeds & Agricultural Inputs|Services (Business / Home)|Ship Repair & Maintenance|Smart Devices / IoT Products|Solar Water Heaters|Spice Processing / Masala Industry|Sugar & Confectionery|Surveying & Mapping|Fisheries|Forestry|Gems & Jewellery|Glass & Glass Products|Healthcare & Hospitals|Herbal / Ayurvedic Products|Hotels & Hospitality|Household & Cleaning Products|HVAC - Heating, Ventilation, Air Conditioning|Industrial Gases|Industrial Machinery|Information Technology/ITES|Jewellery & Accessories|Juice / Soft Drinks / Beverage Industry|Lab Equipment/Scientific Instruments|Leather & Footwear|Marine/Ship Building|Mining & Minerals|Natural Fibres (Cotton, Jute, Wool)|Olive Oil & Cooking Oils|Cloud Services|Real Estate & Construction|Real Estate Agencies|Property Management|Residential Construction|Commercial Construction|Architecture & Design Firms|Professional Services|Management Consulting|Marketing & Advertising Agencies|Event Management|Education|Schools & Colleges|Universities|Vocational Training Institutes|Hotels & Resorts|Travel Agencies|Tour Operators|Airlines|Cruise Lines|Media & Entertainment|Television & Radio Broadcasting|Film Production|Music Industry|Publishing Houses|Digital Media Agencies|Energy & Utilities|Oil & Gas (Upstream, Midstream, Downstream)'.split('|');

export const DROPDOWN_OPTIONSCUS = {
  "Customer Group": ["Corporate", "Industrial", "Services"],

  "Territory": [
    "Sales MG HQ - John Smith",
    "Marketing Central- Jane Doe",
    "IT SP - Bob Johnson",
    "Sales MG HQ - Alice Williams",
    "Marketing North"
  ],

  "Gender": ["Male", "Female"],

  "Account Manager": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com",
    "user4@example.com",
    "user5@example.com"
  ],

  "Market Segment": ["Upper Income", "Middle Income", "Lower Income"],

  "Industry": INDUSTRY_TYPE_OPTIONS,

  "Customer Address Type": [
    "Head Office",
    "Branch Office",
    "Registered Office",
    "Factory Office"
  ]
} as const;
