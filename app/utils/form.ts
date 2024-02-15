const placeholders = [
  'groceries',
  'take out the trash',
  'pet the cat',
  'pet the dog',
  '(please) drink water',
  'have a little treat (you deserve it)',
]

export const getRandomPlaceholder = () => {
  return placeholders[Math.floor(Math.random() * placeholders.length)]
}
