# Griddy

## Introduction

**Griddy** is a game inspired by [GeoGrid].
In GeoGrid, you are presented with a 3×3 grid, which you have to fill in with different countries.
The trick is that each column and each row has a property that its elements have to satisfy—for example, a column could be "Has an animal on its flag".

Griddy allows you to create puzzles in the same style, but expanded to any topic, not just countries!
In fact, Griddy can be about anything: you can create your own game about animals, people, cities, movies, songs, fictional characters...
The limit is your imagination!

To do this, users can create **manifest** files.
Each manifest file is about a topic—for example, one could make a manifest file about movies.
The manifest file would contain:
- A list of all the available **items**, which can be used to fill the blanks in the grid—for example, all the movies nominated to the Academy Award for Best Picture.
- All the possible **categories** and its elements—for instance, "Black and white", "More than 150 min running time", or "Directed by women".

Then, the file is uploaded somewhere accessible by HTTP, (e.g. as a [GitHub Gist]).
The link to the manifest file is shared, and then anyone can play the game.
Everyday, a random puzzle based on the specified items and categories will be generated, and people can play to prove their knowledge on the given topic.

For more details about manifests, see [the section below](#manifests).

## Instructions

Run `yarn` to install the dependencies, and then `yarn dev` to start the development server or `yarn build` to build the project for production.

An instance of the app is deployed on https://griddygame.vercel.app.
The game does not store any data on the backend, so deploying it on your own machine has no added benefits.

## Manifests

A manifest file is a JSON file openly accessible by HTTP with the following structure:

```json
{
  "version": "1",
  "name": "...",
  "items": [ ... ],
  "categories": [
    {
      "name": "...",
      "members": [ ... ]
    },
    ...
  ]
}
```

- `version` specifies the manifest version.
Currently, there's only one version, `1`.
- `name` specifies the name of the topic, e.g. `"Movies nominated for Best Picture"`.
- `items` is an array of strings, containing the names of the items for the game, e.g. `[..., "The Godfather", "The Silence of the Lambs", "Schindler's List", ...]`.
- `categories` is an array of objects, each representing a category of the game.
Each object has two properties:
  - `name`: the name of the property, e.g. `"One-word name"`.
  - `members`: the items that belong in the category, e.g. `[..., "Rocky", "Gladiator", "Oppenheimer", ...]`.

To make a good manifest, the pool of items has to be relatively wide (at least around 100), and each category should contain a sizeable amount of elements.

## Dependencies

This project uses the following technologies:

- [Next.js] as an overall framework
- [React] for reactive components
- [Redux] for state management
- [IndexedDB] via [idb] for local storage
- [Tailwind CSS] for styles

It also uses the following packages for specific tasks:

- [pure-rand] for generating random numbers with a seed
- [fast-json-stable-stringify] to serialize JSONs consistently


[GitHub Gist]: https://gist.github.com/
[GeoGrid]: https://www.geogridgame.com/
[Next.js]: https://nextjs.org/
[React]: https://react.dev/
[Redux]: https://redux.js.org/
[IndexedDB]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[idb]: https://www.npmjs.com/package/idb
[Tailwind CSS]: https://tailwindcss.com/
[pure-rand]: https://www.npmjs.com/package/pure-rand
[fast-json-stable-stringify]: https://www.npmjs.com/package/fast-json-stable-stringify
