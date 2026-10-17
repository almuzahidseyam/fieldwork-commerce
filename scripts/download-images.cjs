const fs = require("fs");
const images = {
  backpack: "photo-1553062407-98eeb64c6a62",
  headphones: "photo-1546435770-a3e426bf472b",
  sneakers: "photo-1549298916-b41d501d3772",
  chair: "photo-1567538096630-e0c55bd6374c",
  duffel: "photo-1553062407-98eeb64c6a62",
  tote: "photo-1590874103328-eac38a683ce7",
  tee: "photo-1521572163474-6864f9cf17ab",
  plant: "photo-1485955900006-10f4d324d411",
  watch: "photo-1524805444758-089113d48a6d",
  speaker: "photo-1608043152269-423dbba4e7e1",
  lamp: "photo-1507473885765-e6ed057f782c",
  camera: "photo-1516035069371-29a1b244cc32",
  hero: "photo-1464822759023-fed622ff2c3b",
  journal: "photo-1472396961693-142e6e269027",
};
Promise.allSettled(
  Object.entries(images).map(async ([name, id]) => {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${name === "hero" ? 1600 : 900}&q=85`;
    const r = await fetch(url);
    if (!r.ok) throw Error(`${name}: ${r.status}`);
    fs.writeFileSync(
      `public/images/${name}.jpg`,
      Buffer.from(await r.arrayBuffer()),
    );
    console.log(`${name}: saved`);
  }),
).then((rs) => {
  if (rs.some((r) => r.status === "rejected")) {
    rs.filter((r) => r.status === "rejected").forEach((r) =>
      console.error(r.reason.message),
    );
    process.exitCode = 1;
  }
});
