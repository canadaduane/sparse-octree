import test from "ava";
import { Raycaster, Vector3 } from "three";
import { Octant, Octree } from "sparse-octree";

const root = new Octant(
	new Vector3(-1, -1, -1),
	new Vector3(1, 1, 1)
);

test("can find intersecting octants", t => {

	const octree = new Octree(root);
	const raycaster = new Raycaster(
		new Vector3(0.5, 0.5, 2),
		new Vector3(0, 0, -1)
	);

	octree.root.split();

	const intersects = octree.getIntersectingNodes(raycaster);

	t.is(intersects.length, 2, "should return two intersecting octant");
	t.is(intersects[0], octree.root.children[7], "should return octant #8");

});
