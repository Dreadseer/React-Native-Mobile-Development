// Cycles through 6 cuisine images based on restaurant or product ID
// Using modulo ensures consistent assignment without manual mapping

const cuisineImages = [
  require('../assets/images/cuisinePasta.jpg'),
  require('../assets/images/cuisineViet.jpg'),
  require('../assets/images/cuisinePizza.jpg'),
  require('../assets/images/cuisineSoutheast.jpg'),
  require('../assets/images/cuisineJapanese.jpg'),
  require('../assets/images/cuisineGreek.jpg'),
];

export const getRestaurantImage = (id: number) => {
  return cuisineImages[id % cuisineImages.length];
};
