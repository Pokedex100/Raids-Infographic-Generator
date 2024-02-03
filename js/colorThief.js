let color_thief = new ColorThief();
let sample_image = new Image();

sample_image.onload = () => {
  let result = ntc.name(
    "#" +
      color_thief
        .getColor(sample_image)
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
  );

  console.log(result[0]); // #f0c420     : Dominant HEX/RGB value of closest match
  console.log(result[1]); // Moon Yellow : Dominant specific color name of closest match
  console.log(result[2]); // #ffff00     : Dominant HEX/RGB value of shade of closest match
  console.log(result[3]); // Yellow      : Dominant color name of shade of closest match
  console.log(result[4]); // false       : True if exact color match
};

sample_image.crossOrigin = "anonymous";
sample_image.src = document.querySelector(".essentials img").src;
