const fs = require('fs')

class Command {
  constructor(name, params) {
    this.name = name
    this.params = params
  }
}

function main() {
  const filename = 'input.txt'
  const commands = getCommandsFromFileName(filename)
  let room = []
  let keycardBooking = []
  let keycard = []

  commands.forEach(command => {
    // console.log('command.name', command)
    switch (command.name) {
      case 'create_hotel': {
        const [floor, roomPerFloor] = command.params;
        // const hotel = { floor, roomPerFloor }
        let keys = 1
        for (let i = 1; i <= floor; i++) {
          for (let b = 1; b <= roomPerFloor; b++) {
            room.push({ room: Number(`${i}0${b}`), name: '', age: 0, keycard: 0, booking: false });
            keycard.push(keys);
            keys++;
          }
        }

        console.log(
          `Hotel created with ${floor} floor(s), ${roomPerFloor} room(s) per floor.`
        );
        return;
      }
      case 'book': {
        const [roomNo, name, age] = command.params
        // const hotel = { room, name }
        const indexRoom = room.findIndex(i => i.room === roomNo);
        if (room[indexRoom].booking) {
          console.log(
            `Cannot book room ${roomNo} for ${name}, The room is currently booked by ${room[indexRoom].name}.`
          );
          return;
        }
        room.splice(indexRoom, 1, { room: roomNo, name, age, keycard: keycard[0], booking: true, });
        keycardBooking.push(keycard[0]);

        console.log(
          `Room ${roomNo} is booked by ${name} with keycard number ${keycard[0]}.`
        );
        keycard.splice(0, 1);
        return
      }
      case 'list_available_rooms': {
        room.filter(i => !i.booking).map(m => console.log(m.room));
        return
      }
      case 'checkout': {
        const [key, name] = command.params;
        const indexRoom = room.findIndex(i => i.keycard === key && i.name === name);
        if (indexRoom < 0) {
          const index = room.findIndex(i => i.keycard === key);
          console.log(`Only ${room[index].name} can checkout with keycard number ${key}.`);
          return;
        }
        const indexKeys = keycardBooking.findIndex(i => i === key);
        keycardBooking.splice(indexKeys, 1);
        keycard.push(room[indexRoom].keycard);
        keycard.sort()
        console.log(`Room ${room[indexRoom].room} is checkout.`);
        room.splice(indexRoom, 1, { room: room[indexRoom].room, name: '', age: '', keycard: 0, booking: false, });
        return;
      }
      case 'list_guest': {
        let name = ''
        room.filter(i => i.booking).map(m => name = name ? `${name}, ${m.name}` : `${m.name}`);
        console.log(name)
        return;
      }
      case 'get_guest_in_room': {
        const [roomNo] = command.params;
        const data = room.find(i => i.room === roomNo);
        console.log(data.name)
        return;
      }
      case 'list_guest_by_age': {
        const [operator, age] = command.params;
        if (operator === '<') {
          room.filter(i => i.age < age).map(m => m.name && console.log(m.name));
        }
        if (operator === '>') {
          room.filter(i => i.age > age).map(m => m.name && console.log(m.name));
        }
        if (operator === '=') {
          room.filter(i => i.age === age).map(m => m.name && console.log(m.name));
        }
        return;
      }
      case 'list_guest_by_floor': {
        const [floor] = command.params;
        room.filter(i => String(i.room).startsWith(floor)).map(m => m.name && console.log(`${m.name}`))
        return;
      }
      case 'checkout_guest_by_floor': {
        const [floor] = command.params;
        let roomNo = ''
        room.filter(i => String(i.room).startsWith(floor)).map((m, index) => {
          if (m.booking) {
            const indexKeys = keycardBooking.findIndex(i => i === m.keycard);
            keycardBooking.splice(indexKeys, 1);
            keycard.push(m.keycard);
            keycard.sort();
            roomNo = roomNo ? `${roomNo}, ${m.room}` : `${m.room}`
            room.splice(index, 1, { room: m.room, name: '', age: '', keycard: 0, booking: false, });
          }
        })
        console.log(`Room ${roomNo} are checkout.`)
        return;
      }
      case 'book_by_floor': {
        const [floor, name, age] = command.params;
        let roomNo = ''
        let keyNo = ''
        const data = room.filter(i => String(i.room).startsWith(floor)).every(m => !m.booking)
        if (data === false) {
          console.log(`Cannot book floor ${floor} for ${name}.`)
          return;
        }
        room.filter(i => String(i.room).startsWith(floor)).map((m, index) => {
          roomNo = roomNo ? `${roomNo}, ${m.room}` : `${m.room}`
          keyNo = keyNo ? `${keyNo}, ${keycard[0]}` : `${keycard[0]}`
          room.splice(index, 1, { room: m.room, name, age, keycard: keycard[0], booking: true, });
          keycardBooking.push(keycard[0]);
          keycard.splice(0, 1);
        })
        console.log(`Room ${roomNo} are booked with keycard number ${keyNo}`)
      }
      default:
        return
    }
  })
}

function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, 'utf-8')

  return file
    .split('\n')
    .map(line => line.split(' '))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName,
          params.map(param => {
            const parsedParam = parseInt(param, 10)

            return Number.isNaN(parsedParam) ? param : parsedParam
          })
        )
    )
}

main()
