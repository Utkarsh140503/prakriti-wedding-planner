export const EXPENSE_CATEGORIES = ['Venue','Catering','Decoration','Photography','Videography','Music & DJ','Band / Dhol','Mehndi Artist','Makeup Artist','Pandit & Ritual','Clothing','Jewellery','Invitations','Transport','Accommodation','Gifts & Shagun','Flowers','Tent & Furniture','Lighting','Generator / Power','Miscellaneous','Other']
export const VENDOR_CATEGORIES = ['Venue','Caterer','Decorator','Photographer','Videographer','DJ / Music','Band / Dhol','Mehndi Artist','Makeup Artist','Pandit','Tent House','Florist','Transport','Invitation Printer','Sweet Shop','Other']
export const VENDOR_STATUSES = ['Enquiry Sent','Quotation Received','Negotiation in Progress','Booked','Advance Paid','Partially Paid','Fully Paid','Service Completed','Cancelled','Pending Confirmation']
export const SHOP_CATEGORIES = ['Clothing','Footwear','Jewellery','Accessories','Cosmetics','Gifts','Packaging','Other']
export const SHOP_PEOPLE = ['Groom','Bride','Father','Mother','Brother','Sister','Family','Other']
export const SHOP_STATUSES = ['To Buy','Shortlisted','Ordered','Purchased','Delivered','Returned','Exchanged','Cancelled','Pending Confirmation']
export const RITUAL_CATEGORIES = ['Pooja Samagri','Haldi Samagri','Mehndi Samagri','Flowers & Garlands','Mithaas & Prasad','Clothing for Rituals','Utensils & Kalash','Other']
export const RITUAL_STATUSES = ['To Arrange','Arranged','Purchased','Ready','Used','Pending Confirmation']
export const RELATIONS = ['Father','Mother','Brother','Sister','Grandfather','Grandmother','Uncle — Chacha','Uncle — Tau','Uncle — Mama','Aunt — Chachi','Aunt — Tai','Aunt — Mami','Aunt — Bua','Cousin','Family Friend','Other']
export const SIDES = ["Groom's Family (Ours)", "Bride's Family", 'Common / Both']
export const SHOPPING_TEMPLATES: { itemName: string; category: string; personFor: string; functionId: string }[] = [
  { itemName: 'Sherwani / Wedding outfit', category: 'Clothing', personFor: 'Groom', functionId: 'main-wedding' },
  { itemName: 'Kurta-pyjama sets for rituals', category: 'Clothing', personFor: 'Groom', functionId: 'other-ceremonies' },
  { itemName: 'Safa / Pagdi', category: 'Accessories', personFor: 'Groom', functionId: 'baraat' },
  { itemName: 'Juti / Mojari', category: 'Footwear', personFor: 'Groom', functionId: 'main-wedding' },
  { itemName: 'Haldi outfit (yellow)', category: 'Clothing', personFor: 'Groom', functionId: 'haldi' },
  { itemName: 'Mehndi outfit', category: 'Clothing', personFor: 'Groom', functionId: 'mehndi' },
  { itemName: 'Reception outfit', category: 'Clothing', personFor: 'Groom', functionId: 'reception' },
  { itemName: 'Saree / Lehengas for functions', category: 'Clothing', personFor: 'Mother', functionId: 'main-wedding' },
  { itemName: 'Kurta sets for functions', category: 'Clothing', personFor: 'Father', functionId: 'main-wedding' },
  { itemName: 'Outfits for all functions', category: 'Clothing', personFor: 'Brother', functionId: 'main-wedding' },
  { itemName: 'Outfits for all functions', category: 'Clothing', personFor: 'Sister', functionId: 'main-wedding' },
  { itemName: 'Clothes & gifts for bride (as per family custom — confirm first)', category: 'Gifts', personFor: 'Bride', functionId: 'other-ceremonies' },
  { itemName: 'Shagun envelopes & packing material', category: 'Packaging', personFor: 'Family', functionId: 'main-wedding' },
]
export const RITUAL_TEMPLATES: { itemName: string; hindiName: string; functionId: string; category: string }[] = [
  { itemName: 'Haldi powder', hindiName: 'हल्दी पाउडर', functionId: 'haldi', category: 'Haldi Samagri' },
  { itemName: 'Raw turmeric', hindiName: 'कच्ची हल्दी', functionId: 'haldi', category: 'Haldi Samagri' },
  { itemName: 'Mustard oil', hindiName: 'सरसों का तेल', functionId: 'haldi', category: 'Haldi Samagri' },
  { itemName: 'Dhan (paddy)', hindiName: 'धान', functionId: 'haldi', category: 'Haldi Samagri' },
  { itemName: 'Lahi (puffed paddy)', hindiName: 'लाही', functionId: 'haldi', category: 'Haldi Samagri' },
  { itemName: 'Batashe', hindiName: 'बताशे', functionId: 'haldi', category: 'Mithaas & Prasad' },
  { itemName: 'Mehndi cones / powder', hindiName: 'मेहंदी', functionId: 'mehndi', category: 'Mehndi Samagri' },
  { itemName: 'Kalash', hindiName: 'कलश', functionId: 'main-wedding', category: 'Utensils & Kalash' },
  { itemName: 'Gangajal', hindiName: 'गंगाजल', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Akshat (rice)', hindiName: 'अक्षत', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Roli', hindiName: 'रोली', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Chandan', hindiName: 'चंदन', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Desi ghee', hindiName: 'देशी घी', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Kapoor (camphor)', hindiName: 'कपूर', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Dhoop & agarbatti', hindiName: 'धूप-अगरबत्ती', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Nariyal (coconut)', hindiName: 'नारियल', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Paan leaves', hindiName: 'पान के पत्ते', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Supari', hindiName: 'सुपारी', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Elaichi & laung', hindiName: 'इलायची-लौंग', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Mishri', hindiName: 'मिश्री', functionId: 'main-wedding', category: 'Mithaas & Prasad' },
  { itemName: 'Janew (sacred thread)', hindiName: 'जनेऊ', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Mauli / Kalawa', hindiName: 'मौली-कलावा', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Havan samagri', hindiName: 'हवन सामग्री', functionId: 'main-wedding', category: 'Pooja Samagri' },
  { itemName: 'Aam ke patte (mango leaves)', hindiName: 'आम के पत्ते', functionId: 'main-wedding', category: 'Flowers & Garlands' },
  { itemName: 'Belpatra', hindiName: 'बेलपत्र', functionId: 'main-wedding', category: 'Flowers & Garlands' },
  { itemName: 'Phool-mala (garlands)', hindiName: 'फूल-माला', functionId: 'main-wedding', category: 'Flowers & Garlands' },
  { itemName: 'Curd, honey, milk (panchamrit)', hindiName: 'दही-शहद-दूध', functionId: 'main-wedding', category: 'Mithaas & Prasad' },
  { itemName: 'Tilak samagri set (confirm with family)', hindiName: 'तिलक सामग्री', functionId: 'other-ceremonies', category: 'Pooja Samagri' },
  { itemName: 'Griha Pravesh kalash & pooja set (confirm with family)', hindiName: 'गृह प्रवेश सामग्री', functionId: 'vidaai-post', category: 'Pooja Samagri' },
]
