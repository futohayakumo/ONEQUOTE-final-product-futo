import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SCHEDULE_DAYS,
  availableEtdOffsets,
  cutOffsFor,
  optionsFrom,
  scheduleFor,
  timelineFor,
} from "./sailings.ts";

test("a lane's schedule covers the window with three services and is sorted by departure", () => {
  const s = scheduleFor("JPYOK", "SGSIN");
  assert.ok(s.length >= 8 + 8 + 4);
  assert.ok(s.every((x) => x.etdOffset >= 0 && x.etdOffset < SCHEDULE_DAYS));
  for (let i = 1; i < s.length; i += 1) assert.ok(s[i].etdOffset >= s[i - 1].etdOffset);
  assert.deepEqual([...new Set(s.map((x) => x.serviceId))].sort(), ["direct", "express", "transship"]);
});

test("the schedule is the same whichever way the lane is written", () => {
  assert.deepEqual(scheduleFor("JPYOK", "SGSIN").map((s) => s.id), scheduleFor("SGSIN", "JPYOK").map((s) => s.id));
});

test("the calendar marks only days something sails, and options start from the chosen day", () => {
  const days = availableEtdOffsets("JPYOK", "SGSIN");
  assert.ok(days.includes(0) && days.includes(3) && days.includes(7));
  assert.ok(!days.includes(1));
  const opts = optionsFrom("JPYOK", "SGSIN", 7);
  assert.ok(opts.length > 0);
  assert.ok(opts.every((o) => o.etdOffset >= 7 && o.etdOffset < 21));
  assert.equal(opts.filter((o) => o.recommended).length, 1);
  assert.equal(opts.find((o) => o.recommended)!.status, "available");
});

test("the express is faster and dearer; the transhipment slower and cheaper", () => {
  const s = scheduleFor("JPTYO", "NLRTM");
  const direct = s.find((x) => x.serviceId === "direct")!;
  const express = s.find((x) => x.serviceId === "express")!;
  const tranship = s.find((x) => x.serviceId === "transship")!;
  assert.ok(express.transitDays < direct.transitDays && express.rateFactor > direct.rateFactor);
  assert.ok(tranship.transitDays > direct.transitDays && tranship.rateFactor < direct.rateFactor);
  assert.ok(tranship.via);
});

test("cut-offs count back from departure in the order the detail panel lists them", () => {
  const s = scheduleFor("JPYOK", "SGSIN").find((x) => x.etdOffset === 7)!;
  assert.deepEqual(cutOffsFor(s).map((c) => [c.id, c.offsetDays]), [["documentation", 4], ["cy", 5], ["vgm", 6]]);
});

test("the timeline runs cut-offs, departure, transhipment if any, arrival", () => {
  const s = scheduleFor("JPYOK", "SGSIN");
  const direct = s.find((x) => x.serviceId === "direct")!;
  const via = s.find((x) => x.serviceId === "transship")!;
  assert.deepEqual(timelineFor(direct, "JPYOK", "SGSIN").map((e) => e.id), ["cutoff-documentation", "cutoff-cy", "cutoff-vgm", "departure", "arrival"]);
  const t = timelineFor(via, "JPYOK", "SGSIN");
  assert.equal(t[4].id, "transhipment");
  assert.equal(t[4].place, via.via);
  assert.equal(t.at(-1)!.offsetDays, via.etdOffset + via.transitDays);
});
