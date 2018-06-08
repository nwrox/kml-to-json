const fs = require('fs')
const kml = fs.readFileSync('.\\divisoes_estaduais.kml')
const municipios = []
const normalize = str => {
  return str.normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/\s/g, '_')
    .toLowerCase()
}

kml.toString('utf8')
  .split('\r\n')
  .reduce((acc, curr, i, arr) => {
    const prev = arr[i - 1]

    if (
      prev &&
      /^<Placemark/.test(prev.trim()) &&
      curr.includes('<name>') &&
      curr.includes('</name>')
    ) {
      const { length: len } = municipios
      const kmlName = normalize(
        curr.replace(/(<name>|<\/name>)/g, '')
          .trim()
      )


      acc = [...acc, { [`${kmlName}`]: '' }]
      municipios[len] = kmlName
    }

    if (curr.includes('<coordinates>')) {
      const kmlCoords = curr.replace(/[a-zA-z></]/g, '')
        .split(' ')
        .filter(el => el !== '')
        .reduce((acc, curr) => {
          const coords = curr.split(',')
            .reverse()

          return [
            ...acc,
            {
              lat: parseFloat(coords[1]),
              lng: parseFloat(coords[2])
            }
          ]
        }, [])
      const key = Object.keys(acc[acc.length - 1])[0]

      Object.assign(acc[acc.length - 1], {
        [`${key}`]: kmlCoords
      })
    }

    return acc
  }, []).forEach(el => {
    const name = Object.keys(el)[0]

    console.log(`Creating the county json: ${name}`)

    fs.writeFileSync(`.\\output\\${name}.json`, JSON.stringify(el[name]))
  })

  fs.writeFileSync(`.\\output\\municipios.json`, JSON.stringify(municipios))

  console.log('Done!')
