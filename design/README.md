# Proportion sketches

These OpenSCAD files are a **design record, not a build input**. Nothing here
is exported, imported, or shipped.

The 3D scene on the Process Comparison screen is authored procedurally in
Three.js. OpenSCAD was used only to settle the millimetres: model the part,
orbit it in the GUI until the proportions read correctly, then transcribe the
numbers into `src/components/process/scene/layout.ts` and `geometry.ts` as
named constants.

Why the meshes are not exported from here:

- OpenSCAD has no scene graph and no pivots. `union()` fuses everything into
  one manifold, so a hinged elbow would mean exporting the upper arm and the
  forearm as separate STL files and hand-correcting each origin in Three.js.
  The scene has 18+ independently moving parts.
- Its strengths are booleans, `hull()` and fillets — rounded, blended forms.
  The design system forbids all of them. A desk that is five boxes is on-brand.
- Binary STL is 50 bytes per triangle, non-indexed. Procedural geometry is
  zero bytes of assets.
- One STL is one mesh and therefore one material. A desk needs a white top and
  charcoal legs; a box needs a white body and a slate seam.

To open a sketch:

    openscad design/desk.scad

