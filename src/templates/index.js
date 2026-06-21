import beautySalon from "./beauty_salon.js"
import cosmetics from "./cosmetics.js"
import barbershop from "./barbershop.js"
import nailSalon from "./nail_salon.js"
import spaWellness from "./spa_wellness.js"
import restaurant from "./restaurant.js"
import photoStudio from "./photo_studio.js"
import custom from "./custom.js"

const templates = {
  beauty_salon: beautySalon,
  cosmetics: cosmetics,
  barbershop: barbershop,
  nail_salon: nailSalon,
  spa_wellness: spaWellness,
  restaurant: restaurant,
  photo_studio: photoStudio,
  custom: custom
}

export default templates
export { beautySalon, cosmetics, barbershop, nailSalon, spaWellness, restaurant, photoStudio, custom }
