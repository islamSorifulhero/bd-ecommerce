// lib/bd-locations.ts
// All 64 districts of Bangladesh, grouped implicitly (flat map here).
// Thana/Upazila lists below cover the major ones per district — extend any
// array as needed; the checkout form and shipping logic only require the
// DISTRICT name to be correct (thana is for the address label).

export const BD_DISTRICTS: Record<string, string[]> = {
  // Dhaka Division
  Dhaka: ["Dhanmondi", "Gulshan", "Mirpur", "Mohammadpur", "Uttara", "Tejgaon", "Ramna", "Savar", "Keraniganj", "Demra"],
  Gazipur: ["Gazipur Sadar", "Tongi", "Kaliakair", "Kapasia", "Sreepur", "Kaliganj"],
  Narayanganj: ["Narayanganj Sadar", "Rupganj", "Sonargaon", "Araihazar", "Bandar", "Siddhirganj"],
  Narsingdi: ["Narsingdi Sadar", "Palash", "Belabo", "Monohardi", "Raipura", "Shibpur"],
  Tangail: ["Tangail Sadar", "Mirzapur", "Gopalpur", "Ghatail", "Kalihati", "Madhupur"],
  Manikganj: ["Manikganj Sadar", "Saturia", "Singair", "Shibalaya", "Ghior"],
  Munshiganj: ["Munshiganj Sadar", "Sreenagar", "Sirajdikhan", "Louhajong", "Gazaria"],
  Faridpur: ["Faridpur Sadar", "Boalmari", "Alfadanga", "Bhanga", "Madhukhali"],
  Gopalganj: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
  Madaripur: ["Madaripur Sadar", "Rajoir", "Kalkini", "Shibchar"],
  Rajbari: ["Rajbari Sadar", "Goalandaghat", "Pangsha", "Baliakandi"],
  Shariatpur: ["Shariatpur Sadar", "Naria", "Zajira", "Bhedarganj", "Damudya"],
  Kishoreganj: ["Kishoreganj Sadar", "Bhairab", "Karimganj", "Kuliarchar", "Pakundia"],

  // Chattogram Division
  Chattogram: ["Panchlaish", "Kotwali", "Pahartali", "Halishahar", "Patiya", "Hathazari", "Sitakunda"],
  "Cox's Bazar": ["Cox's Bazar Sadar", "Teknaf", "Ukhia", "Chakaria", "Ramu", "Maheshkhali"],
  Cumilla: ["Cumilla Sadar", "Debidwar", "Laksam", "Chandina", "Muradnagar", "Daudkandi"],
  Brahmanbaria: ["Brahmanbaria Sadar", "Ashuganj", "Nabinagar", "Sarail", "Kasba"],
  Chandpur: ["Chandpur Sadar", "Matlab North", "Matlab South", "Haziganj", "Kachua"],
  Feni: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Sonagazi", "Parshuram"],
  Lakshmipur: ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"],
  Noakhali: ["Noakhali Sadar", "Begumganj", "Companiganj", "Hatiya", "Senbagh"],
  Khagrachari: ["Khagrachari Sadar", "Dighinala", "Panchhari", "Ramgarh"],
  Rangamati: ["Rangamati Sadar", "Kaptai", "Baghaichari", "Kawkhali"],
  Bandarban: ["Bandarban Sadar", "Lama", "Naikhongchhari", "Ruma"],

  // Rajshahi Division
  Rajshahi: ["Rajshahi Sadar (Boalia)", "Paba", "Godagari", "Tanore", "Puthia", "Bagmara"],
  Natore: ["Natore Sadar", "Baraigram", "Bagatipara", "Gurudaspur", "Singra"],
  Naogaon: ["Naogaon Sadar", "Mohadevpur", "Patnitala", "Dhamoirhat", "Niamatpur"],
  Chapainawabganj: ["Chapainawabganj Sadar", "Shibganj", "Gomastapur", "Nachole"],
  Pabna: ["Pabna Sadar", "Ishwardi", "Bera", "Santhia", "Sujanagar"],
  Bogura: ["Bogura Sadar", "Sherpur", "Shibganj", "Sonatola", "Dhunat"],
  Sirajganj: ["Sirajganj Sadar", "Kazipur", "Shahjadpur", "Ullapara", "Belkuchi"],
  Joypurhat: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"],

  // Khulna Division
  Khulna: ["Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur", "Batiaghata", "Dumuria"],
  Jashore: ["Jashore Sadar", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur"],
  Satkhira: ["Satkhira Sadar", "Kalaroa", "Tala", "Kaliganj", "Shyamnagar"],
  Bagerhat: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Mongla", "Rampal"],
  Jhenaidah: ["Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
  Magura: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
  Narail: ["Narail Sadar", "Kalia", "Lohagara"],
  Kushtia: ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali"],
  Meherpur: ["Meherpur Sadar", "Gangni", "Mujibnagar"],
  Chuadanga: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],

  // Barishal Division
  Barishal: ["Barishal Sadar", "Bakerganj", "Babuganj", "Banaripara", "Gournadi"],
  Bhola: ["Bhola Sadar", "Borhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan"],
  Patuakhali: ["Patuakhali Sadar", "Bauphal", "Dumki", "Galachipa", "Kalapara"],
  Pirojpur: ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nesarabad"],
  Barguna: ["Barguna Sadar", "Amtali", "Betagi", "Patharghata"],
  Jhalokati: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],

  // Sylhet Division
  Sylhet: ["Sylhet Sadar", "Beanibazar", "Golapganj", "Zakiganj", "Companiganj", "Jaintiapur"],
  Moulvibazar: ["Moulvibazar Sadar", "Kulaura", "Sreemangal", "Rajnagar", "Juri"],
  Habiganj: ["Habiganj Sadar", "Nabiganj", "Baniyachong", "Chunarughat", "Madhabpur"],
  Sunamganj: ["Sunamganj Sadar", "Chhatak", "Jagannathpur", "Derai", "Tahirpur"],

  // Rangpur Division
  Rangpur: ["Rangpur Sadar", "Mithapukur", "Pirganj", "Badarganj", "Kaunia"],
  Dinajpur: ["Dinajpur Sadar", "Birganj", "Birampur", "Fulbari", "Parbatipur"],
  Kurigram: ["Kurigram Sadar", "Bhurungamari", "Chilmari", "Nageshwari", "Ulipur"],
  Gaibandha: ["Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur", "Sundarganj"],
  Nilphamari: ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Saidpur"],
  Panchagarh: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],
  Thakurgaon: ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"],
  Lalmonirhat: ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"],

  // Mymensingh Division
  Mymensingh: ["Mymensingh Sadar", "Trishal", "Muktagacha", "Bhaluka", "Gafargaon"],
  Jamalpur: ["Jamalpur Sadar", "Sarishabari", "Madarganj", "Melandaha", "Islampur"],
  Netrokona: ["Netrokona Sadar", "Atpara", "Durgapur", "Kendua", "Mohanganj"],
  Sherpur: ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"],
};

export const DHAKA_DISTRICT_NAME = "Dhaka";

export function calculateShippingCharge(district: string): number {
  return district === DHAKA_DISTRICT_NAME ? 80 : 150;
}
