// Proportion sketch for the seated worker.
// The arm is split at the elbow here only to check reach and pivot heights —
// in the shipped scene the hinge is a nested <group>, not two meshes.

torso_r     = 160;  // mm
torso_len   = 340;
torso_y     = 950;
head_r      = 110;
head_y      = 1280;
shoulder_y  = 1100;
shoulder_x  =  200;
upper_len   =  260;
fore_len    =  240;

module capsule(r, len) {
  hull() {
    translate([0, 0,  len / 2]) sphere(r = r, $fn = 24);
    translate([0, 0, -len / 2]) sphere(r = r, $fn = 24);
  }
}

module arm(elbow_deg = 50) {
  rotate([-30, 0, 0]) {
    translate([0, 0, upper_len / 2]) cube([70, 70, upper_len], center = true);
    translate([0, 0, upper_len])
      rotate([-elbow_deg, 0, 0])
        translate([0, 0, fore_len / 2]) cube([60, 60, fore_len], center = true);
  }
}

module worker() {
  translate([0, 0, torso_y]) rotate([90, 0, 0]) capsule(torso_r, torso_len);
  translate([0, 0, head_y]) sphere(r = head_r, $fn = 16);
  for (sx = [-1, 1]) translate([sx * shoulder_x, 0, shoulder_y]) arm();
}

worker();
