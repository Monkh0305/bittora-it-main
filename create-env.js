const fs = require("fs");

const envContent = "PORT=3000\n";

if (!fs.existsSync(".env")) {
  fs.writeFileSync(".env", envContent);
  console.log(".env file created with PORT=3000");
} else {
  console.log(".env already exists");
}