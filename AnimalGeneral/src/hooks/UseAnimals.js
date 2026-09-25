import { useEffect, useState } from "react";

const animals = [
  {
    id: 1,
    name: "African Lion",
    scientificName: "Panthera leo",
    category: "Mammals",
    status: "Vulnerable",
    location: "Africa",
    diet: "Carnivore",
    image:
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1000&q=85",
    description:
      "The African lion is one of the world's most recognizable big cats. Lions are highly social animals that live in family groups called prides and play an important role as apex predators in their ecosystems.",
  },
  {
    id: 2,
    name: "Bengal Tiger",
    scientificName: "Panthera tigris tigris",
    category: "Mammals",
    status: "Endangered",
    location: "South Asia",
    diet: "Carnivore",
    image:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1000&q=85",
    description:
      "The Bengal tiger is a powerful solitary predator known for its distinctive striped coat. It inhabits forests, grasslands and mangrove ecosystems across parts of South Asia.",
  },
  {
    id: 3,
    name: "Golden Eagle",
    scientificName: "Aquila chrysaetos",
    category: "Birds",
    status: "Least Concern",
    location: "Northern Hemisphere",
    diet: "Carnivore",
    image:
      "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=1000&q=85",
    description:
      "The golden eagle is a large bird of prey with exceptional eyesight and powerful talons. It can be found across mountains, open country and other rugged landscapes.",
  },
  {
    id: 4,
    name: "Green Sea Turtle",
    scientificName: "Chelonia mydas",
    category: "Reptiles",
    status: "Endangered",
    location: "Tropical Oceans",
    diet: "Herbivore",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
    description:
      "Green sea turtles spend most of their lives in the ocean and travel long distances between feeding and nesting grounds. They are especially associated with warm tropical and subtropical waters.",
  },
  {
    id: 5,
    name: "Red Panda",
    scientificName: "Ailurus fulgens",
    category: "Mammals",
    status: "Endangered",
    location: "Himalayas",
    diet: "Omnivore",
    image:
      "https://images.unsplash.com/photo-1523364395223-6d3d4a6c4a38?auto=format&fit=crop&w=1000&q=85",
    description:
      "The red panda is a small tree-dwelling mammal with reddish fur and a long ringed tail. It lives in high-altitude forests and spends much of its time in trees.",
  },
  {
    id: 6,
    name: "Emperor Penguin",
    scientificName: "Aptenodytes forsteri",
    category: "Birds",
    status: "Near Threatened",
    location: "Antarctica",
    diet: "Carnivore",
    image:
      "https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?auto=format&fit=crop&w=1000&q=85",
    description:
      "Emperor penguins are the largest living penguins and are specially adapted to the extreme Antarctic environment. They breed during the harsh polar winter.",
  },
  {
    id: 7,
    name: "Blue Whale",
    scientificName: "Balaenoptera musculus",
    category: "Mammals",
    status: "Endangered",
    location: "Global Oceans",
    diet: "Filter Feeder",
    image:
      "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=1000&q=85",
    description:
      "The blue whale is the largest animal known to have ever lived. Despite its enormous size, it feeds primarily on tiny organisms called krill.",
  },
  {
    id: 8,
    name: "Red-Eyed Tree Frog",
    scientificName: "Agalychnis callidryas",
    category: "Amphibians",
    status: "Least Concern",
    location: "Central America",
    diet: "Insectivore",
    image:
      "https://images.unsplash.com/photo-1527150297-8b2f5a7f8e9c?auto=format&fit=crop&w=1000&q=85",
    description:
      "The red-eyed tree frog is a colorful nocturnal amphibian associated with tropical rainforests. Its vivid eyes and bright body markings make it one of the best-known tropical frogs.",
  },
  {
    id: 9,
    name: "Great White Shark",
    scientificName: "Carcharodon carcharias",
    category: "Fish",
    status: "Vulnerable",
    location: "Global Oceans",
    diet: "Carnivore",
    image:
      "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=1000&q=85",
    description:
      "The great white shark is a large predatory shark found in coastal waters around the world. It plays an important ecological role as a top marine predator.",
  },
  {
    id: 10,
    name: "Giant Panda",
    scientificName: "Ailuropoda melanoleuca",
    category: "Mammals",
    status: "Vulnerable",
    location: "China",
    diet: "Herbivore",
    image:
      "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1000&q=85",
    description:
      "Giant pandas are bamboo specialists native to mountain forests of China. Their distinctive black-and-white appearance has made them one of the world's most recognizable mammals.",
  },
  {
    id: 11,
    name: "Red Fox",
    scientificName: "Vulpes vulpes",
    category: "Mammals",
    status: "Least Concern",
    location: "Northern Hemisphere",
    diet: "Omnivore",
    image:
      "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=1000&q=85",
    description:
      "The red fox is one of the most widely distributed carnivorous mammals. It is highly adaptable and can live in forests, grasslands, mountains and even urban environments.",
  },
  {
    id: 12,
    name: "Macaw",
    scientificName: "Ara macao",
    category: "Birds",
    status: "Least Concern",
    location: "Central & South America",
    diet: "Omnivore",
    image:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1000&q=85",
    description:
      "Scarlet macaws are brilliantly colored parrots found in tropical forests. Their strong curved bills allow them to crack open tough fruits and seeds.",
  },
];

function useAnimals() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(animals);
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  return {
    animals: data,
    loading,
  };
}

export default useAnimals;
