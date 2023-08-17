import fs from "fs/promises";
//fs promises is used with async/await or .then.catch

fs.readFile("src/text.txt", "utf-8")
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
