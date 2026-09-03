// Proportion sketch for the workstation desk.
// Transcribed to DESK in src/components/process/scene/layout.ts.

top_w   = 1600;  // mm
top_d   =  800;
top_t   =   60;
height  =  720;
leg     =   60;
inset   =   90;  // leg inset from each corner

module desk_top() {
  translate([0, 0, height]) cube([top_w, top_d, top_t], center = true);
}

module desk_legs() {
  for (sx = [-1, 1], sy = [-1, 1])
    translate([sx * (top_w / 2 - inset), sy * (top_d / 2 - inset), height / 2])
      cube([leg, leg, height], center = true);
}

module desk() { desk_top(); desk_legs(); }

desk();
