import type { WeddingTask } from '../types'
type T = [string, string] // [functionId, title]
const RAW: T[] = [
  ['pre-wedding','Budget preparation'],['pre-wedding','Venue booking'],['pre-wedding','Tent and decoration'],
  ['pre-wedding','Catering'],['pre-wedding','Guest list'],['pre-wedding','Invitation design, printing and distribution'],
  ['pre-wedding','Digital invitations'],['pre-wedding','RSVP follow-up'],['pre-wedding','Hotel bookings and room allocation'],
  ['pre-wedding','Transportation'],['pre-wedding','Photographer and videographer'],['pre-wedding','DJ and sound'],
  ['pre-wedding','Band and dhol'],['pre-wedding','Makeup artists'],['pre-wedding',"Groom's outfits"],['pre-wedding','Family outfits'],
  ['pre-wedding','Jewellery and footwear'],['pre-wedding','Gifts and return gifts'],['pre-wedding','Shagun envelopes'],
  ['pre-wedding','Home cleaning and decoration'],['pre-wedding','Generator and electricity backup'],['pre-wedding','Water arrangements'],
  ['pre-wedding','Medical arrangements'],['pre-wedding','Emergency contacts list'],['pre-wedding','Vendor contracts'],['pre-wedding','Advance payments and final payment schedule'],
  ['geet-sangeet','Geet/Sangeet venue, stage and decoration'],['geet-sangeet','Lighting, sound system and microphones'],['geet-sangeet','DJ and music playlist'],
  ['geet-sangeet','Dance performances and rehearsals'],['geet-sangeet','Anchoring and function schedule'],['geet-sangeet','Seating, food and refreshments'],
  ['haldi','Haldi ingredients and ritual thalis'],['haldi','Flowers, flower jewellery and decorations'],['haldi',"Groom's and family clothes for Haldi"],
  ['haldi','Water, towels and spare clothes'],['haldi','Music, dhol and photography for Haldi'],['haldi','Food, refreshments and cleaning arrangements'],
  ['mehndi','Mehndi artists booking'],['mehndi','Mehndi cones and design references'],['mehndi','Mehndi seating and decoration'],
  ['mehndi','Mehndi music, food and photography'],['mehndi','Drying and aftercare arrangements'],
  ['sil-main-poojan','Confirm Sil Main Poojan procedure with family and pandit — Pending Confirmation'],['sil-main-poojan','Pandit confirmation for Sil Main Poojan'],
  ['sil-main-poojan','Puja samagri, thalis and utensils for Sil Main Poojan'],['sil-main-poojan','Flowers, fruits, sweets and prasad'],['sil-main-poojan','Diya, incense, seating and participants'],
  ['baraat','Ghodi booking'],['baraat','Band, baja and dhol for Baraat'],['baraat',"Groom's vehicle and other vehicles"],['baraat','Safa, pagdi, sehra and kalgi'],
  ['baraat','Baraat route, departure and arrival plan'],['baraat','Water, refreshments and welcome arrangements'],['baraat','Parking, traffic and safety contacts'],
  ['main-wedding','Groom preparation, dressing and emergency kit'],['main-wedding','Milni arrangements'],['main-wedding','Jaimala stage and varmala'],
  ['main-wedding','Mandap and havan kund setup'],['main-wedding','Pandit and puja samagri for main ceremony'],['main-wedding','Pheras and main wedding rituals coordination'],
  ['main-wedding','Seating and elderly guest assistance'],['main-wedding','Shagun and gift collection point'],
  ['reception','Reception venue, stage and decoration — date/venue Pending Confirmation'],['reception','Catering, menu and seating for Reception'],
  ['reception','Couple entry, outfits and makeup'],['reception','Gift collection and return gifts'],['reception','Parking, transportation and vendor payments'],
  ['vidaai-post','Vidaai arrangements'],['vidaai-post','Griha Pravesh and post-wedding rituals'],['vidaai-post','Hotel checkout and relatives departure'],
  ['vidaai-post','Gift inventory'],['vidaai-post','Vendor settlement and rented item returns'],['vidaai-post','Photography and video delivery follow-up'],
  ['vidaai-post','Thank-you messages'],['vidaai-post','Final budget reconciliation'],
]
export const TEMPLATE_TASKS: Omit<WeddingTask,'id'>[] = RAW.map(([functionId, title]) => ({
  title, functionId, description: 'Template task — edit details, assign one primary owner and set a deadline.',
  ownerName: 'Unassigned — Pending Confirmation', priority: 'Medium', status: 'Not Started', isTemplate: true,
}))
