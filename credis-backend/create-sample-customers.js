const storeId = "fc8516c1-5068-4be9-8025-ed99d2890692";
const apiUrl = "http://localhost:8080/api/customers";

const sampleCustomers = [
  {
    storeId,
    name: "Tashi Dorji",
    phone_number: "17123456",
    email: "tashi.dorji@gmail.com",
    creditLimit: 50000,
  },
  {
    storeId,
    name: "Pema Wangmo",
    phone_number: "77234567",
    email: "pema.wangmo@yahoo.com",
    creditLimit: 75000,
  },
  {
    storeId,
    name: "Kinley Tshering",
    phone_number: "17345678",
    email: "kinley.tshering@gmail.com",
    creditLimit: 100000,
  },
  {
    storeId,
    name: "Sonam Choden",
    phone_number: "77456789",
    email: "sonam.choden@hotmail.com",
    creditLimit: 60000,
  },
  {
    storeId,
    name: "Ugyen Dorji",
    phone_number: "17567890",
    email: "ugyen.dorji@gmail.com",
    creditLimit: 80000,
  },
  {
    storeId,
    name: "Karma Lhamo",
    phone_number: "77678901",
    email: "karma.lhamo@yahoo.com",
    creditLimit: 45000,
  },
  {
    storeId,
    name: "Phuntsho Wangdi",
    phone_number: "17789012",
    email: "phuntsho.wangdi@gmail.com",
    creditLimit: 90000,
  },
  {
    storeId,
    name: "Deki Yangzom",
    phone_number: "77890123",
    email: "deki.yangzom@gmail.com",
    creditLimit: 55000,
  },
  {
    storeId,
    name: "Tenzin Namgay",
    phone_number: "17901234",
    email: "tenzin.namgay@hotmail.com",
    creditLimit: 70000,
  },
  {
    storeId,
    name: "Chimi Dorji",
    phone_number: "77012345",
    email: "chimi.dorji@gmail.com",
    creditLimit: 85000,
  },
];

async function createCustomers() {
  console.log("Creating 10 sample customers...\n");

  for (let i = 0; i < sampleCustomers.length; i++) {
    const customer = sampleCustomers[i];
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✓ Created customer ${i + 1}: ${customer.name}`);
        console.log(`  ID: ${data.data.id}`);
        console.log(`  Phone: ${customer.phone_number}`);
        console.log(
          `  Credit Limit: Nu. ${customer.creditLimit.toLocaleString()}\n`
        );
      } else {
        console.error(`✗ Failed to create customer ${i + 1}: ${customer.name}`);
        console.error(`  Error: ${data.message}\n`);
      }
    } catch (error) {
      console.error(`✗ Error creating customer ${i + 1}: ${customer.name}`);
      console.error(`  ${error.message}\n`);
    }
  }

  console.log("Done! All customers created.");
}

createCustomers();
