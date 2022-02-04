function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

process.on("message", (num) => {
  let data = {};

  for (let i = 0; i < num; i++) {
    let randomNumber = getRandomInteger(1, 1000);
    if (Object.keys(data).some((key) => parseInt(key) === randomNumber)) {
      data[randomNumber] += 1;
    } else {
      data[randomNumber] = 1;
    }
  }
  process.send(data);
});
