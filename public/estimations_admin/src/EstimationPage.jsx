import React, { useState, useRef, useEffect, use } from 'react';
import { ArrowLeft, Share2, Download, X, Upload, Building2, Phone, Mail, MapPin, ChevronDown, ChevronUp, Plus, Trash2, Calculator, TrendingUp, DollarSign, Percent, FileText, Info, Maximize2, Minimize2, Save } from 'lucide-react';
import Select from 'react-select';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Static dataset with U/P set to $26.14 for specified material items and updated E/H for turf items
const dataItems = [
  { name: 'Labor-Maint', unit: 'Hr', uP: 26.25, gm: 46.83, eH: 1, qty: 1, category: 'Labor' },
  { name: 'Labor-Maint Travel', unit: 'Hr', uP: 26.25, gm: 46.83, eH: 1, qty: 1, category: 'Labor' },
  { name: 'Labor - Maint - Mulch', unit: 'Hr', uP: 26.25, gm: 33.34, eH: 1, qty: 1, category: 'Labor' },
  { name: 'Black Dyed Mulch @ 1"', unit: 'cu. yd.', uP: 26.14, gm: 33.34, eH: 0, qty: 70.03, category: 'Material' },
  { name: 'Black Dyed Mulch @ 2"', unit: 'cu. yd.', uP: 26.14, gm: 46.83, eH: 0, qty: 140.06, category: 'Material' },
  { name: 'Black Dyed Mulch @ 3"', unit: 'cu. yd.', uP: 26.14, gm: 46.83, eH: 0, qty: 210.08, category: 'Material' },
  { name: 'Brown Dyed Mulch @ 1"', unit: 'cu. yd.', uP: 26.14, gm: 46.83, eH: 0, qty: 70.03, category: 'Material' },
  { name: 'Brown Dyed Mulch @ 2"', unit: 'cu. yd.', uP: 26.14, gm: 33.34, eH: 0, qty: 140.06, category: 'Material' },
  { name: 'Brown Dyed Mulch @ 3"', unit: 'cu. yd.', uP: 26.14, gm: 33.34, eH: 0, qty: 210.08, category: 'Material' },
  { name: 'Red Dyed Mulch @ 1"', unit: 'cu. yd.', uP: 26.14, gm: 33.34, eH: 0, qty: 70.03, category: 'Material' },
  { name: 'Red Dyed Mulch @ 2"', unit: 'cu. yd.', uP: 26.14, gm: 33.34, eH: 0, qty: 140.06, category: 'Material' },
  { name: 'Red Dyed Mulch @ 3"', unit: 'cu. yd.', uP: 26.14, gm: 33.34, eH: 0, qty: 210.08, category: 'Material' },
  { name: 'Triple Ground Mulch @ 1"', unit: 'cu. yd.', uP: 26.14, gm: 33.34, eH: 0, qty: 210.08, category: 'Material' },
  { name: 'Broadstar herbicide - 50lb', unit: 'lb', uP: 26.25, gm: 41.34, eH: 0, qty: 500, category: 'Material' },
  { name: 'Fine Turf Mowing - 30"', unit: 'Sqft', uP: 26.25, gm: 46.82, eH: 3.50, qty: 25410, category: 'Labor' },
  { name: 'Fine Turf Mowing - 48"', unit: 'Sqft', uP: 26.25, gm: 46.83, eH: 0.61, qty: 13200, category: 'Labor' },
  { name: 'Fine Turf Mowing - 60"', unit: 'Sqft', uP: 26.25, gm: 46.83, eH: 0.28, qty: 12000, category: 'Labor' },
  { name: 'Line Trimming', unit: 'Hr', uP: 26.25, gm: 46.82, eH: 1.00, qty: 1, category: 'Labor' },
  { name: 'Mow Clean Up', unit: 'Hr', uP: 26.25, gm: 46.82, eH: 1.00, qty: 1, category: 'Labor' },
  { name: 'Round Up QuikPRO', unit: 'Ea', uP: 26.25, gm: 30.00, eH: 0, qty: 0.30, category: 'Material' },
  { name: 'Trimtect', unit: 'oz', uP: 26.25, gm: 41.34, eH: 0, qty: 50, category: 'Material' },
  { name: 'Pansy Misc. 3.5" 18/flat', unit: 'flat', uP: 26.25, gm: 43.23, eH: 0, qty: 1, category: 'Material' },
  { name: 'Annual Standard Misc 3.5" 18/flat', unit: 'flat', uP: 26.25, gm: 43.14, eH: 0, qty: 1, category: 'Material' },
  { name: 'Fertilizer - 10-10-10', unit: '40lb bag', uP: 26.25, gm: 41.32, eH: 0, qty: 100, category: 'Material' },
  { name: 'Water In Plants', unit: 'Hr', uP: 26.25, gm: 33.34, eH: 1.00, qty: 1, category: 'Labor' },
  { name: 'Sub-contractor/Owner', unit: 'Dollars', uP: 26.25, gm: 40.84, eH: 0, qty: 1000, category: 'Sub-contractor' },
  { name: 'Labor-Irrigation', unit: 'Hr', uP: 26.25, gm: 79.87, eH: 1.00, qty: 1, category: 'Labor' },
  { name: 'Labor-Irrigation Travel', unit: 'Hr', uP: 26.25, gm: 79.87, eH: 5.00, qty: 5, category: 'Labor' },
];

// Grouped options 
const groupedOptions = [
  { label: 'Labor', options: dataItems.filter(item => item.category === 'Labor').map(item => ({ value: item.name, label: item.name, data: item })) },
  { label: 'Material', options: dataItems.filter(item => item.category === 'Material').map(item => ({ value: item.name, label: item.name, data: item })) },
  { label: 'Sub-contractor', options: dataItems.filter(item => item.category === 'Sub-contractor').map(item => ({ value: item.name, label: item.name, data: item })) },
];
const unitOptions = [
  { value: 'Hr', label: 'Hr' },
  { value: 'Sqft', label: 'Sqft' },
  { value: 'Cu.yd', label: 'Cu.yd' },
  { value: 'flat', label: 'flat' },
  { value: 'others', label: 'others' },
];
const initialData = [
  {
    type: 'Category',
    name: 'Maintenance Services Contract',
    gm: 42.00,
    tP: 2207149.10,
    sections: [
      {
        type: 'Section',
        name: 'Spring Clean Up',
        occ: 1,
        comp: 0.00,
        eH: 29.00,
        th: 754.00,
        gm: 46.83,
        pOcc: 1431.73,
        tP: 37224.94,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 1, qty: 24, unit: 'Hr', eH: 24.00, th: 624.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 1184.88, tP: 30806.85, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.00, th: 130.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 246.85, tP: 6418.09, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Spring Mulch',
        occ: 1,
        comp: 0.00,
        eH: 2.00,
        th: 52.00,
        gm: 42.15,
        pOcc: 37646.93,
        tP: 978820.07,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 1, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 49.37, tP: 1283.62, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor - Maint - Mulch', occ: 1, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 17.50, gm: 33.34, sP: 26.25, pOcc: 26.25, tP: 682.57, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Summer Bed Application',
        occ: 1,
        comp: 0.00,
        eH: 24.00,
        th: 624.00,
        gm: 43.30,
        pOcc: 3315.80,
        tP: 86210.87,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 1, qty: 24, unit: 'Hr', eH: 24.00, th: 624.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 1184.88, tP: 30806.85, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Fine Turf Mowing',
        occ: 26,
        comp: 0.00,
        eH: 0, // Will be recalculated in useEffect
        th: 0, // Will be recalculated in useEffect
        gm: 0, // Will be recalculated in useEffect
        pOcc: 0, // Will be recalculated in useEffect
        tP: 0, // Will be recalculated in useEffect
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 26, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 49.37, tP: 1283.62, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Fine Turf Mowing - 30"', occ: 26, qty: 13200, unit: 'Sqft', eH: (13200 / 7267) * (1 + 0.00 + 0.10), th: ((13200 / 7267) * (1 + 0.00 + 0.10)) * 26, uP: 26.40, gm: 46.82, sP: 49.64, pOcc: 108.21, tP: 108.21 * 26, addlComp: 0, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Fine Turf Mowing - 48"', occ: 26, qty: 13200, unit: 'Sqft', eH: (13200 / 21800) * (1 + 0.00 + 0.00), th: ((13200 / 21800) * (1 + 0.00 + 0.00)) * 26, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: ((13200 / 21800) * (1 + 0.00 + 0.00)) * 49.37 * (1 + 0.00), tP: (((13200 / 21800) * (1 + 0.00 + 0.00)) * 49.37 * (1 + 0.00)) * 26, addlComp: 0.00, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Fine Turf Mowing - 60"', occ: 26, qty: 12000, unit: 'Sqft', eH: (12000 / 43554) * (1 + 0.00 + 0.00), th: ((12000 / 43554) * (1 + 0.00 + 0.00)) * 26, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: ((12000 / 43554) * (1 + 0.00 + 0.00)) * 49.37 * (1 + 0.00), tP: (((12000 / 43554) * (1 + 0.00 + 0.00)) * 49.37 * (1 + 0.00)) * 26, addlComp: 0.00, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Line Trimming', occ: 26, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 27.78, gm: 46.82, sP: 52.24, pOcc: 52.24, tP: 1358.18, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Mow Clean Up', occ: 26, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 26.25, gm: 46.82, sP: 49.36, pOcc: 49.37, tP: 1283.38, addlComp: 0.00, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Bed Maintenance',
        occ: 26,
        comp: 0.00,
        eH: 1.30,
        th: 33.80,
        gm: 40.09,
        pOcc: 107.04,
        tP: 2782.99,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 26, qty: 1.3, unit: 'Hr', eH: 1.30, th: 33.80, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 64.18, tP: 1668.70, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Hard Surface Weed Control',
        occ: 6,
        comp: 0.00,
        eH: 1.50,
        th: 39.00,
        gm: 42.14,
        pOcc: 102.63,
        tP: 2668.29,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 6, qty: 1.5, unit: 'Hr', eH: 1.50, th: 39.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 74.05, tP: 1925.43, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: '1st Shrub Pruning',
        occ: 1,
        comp: 0.00,
        eH: 2.00,
        th: 52.00,
        gm: 44.01,
        pOcc: 202.73,
        tP: 5270.95,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 1, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 49.37, tP: 1283.62, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 1, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 49.37, tP: 1283.62, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: '2nd Shrub Pruning',
        occ: 1,
        comp: 0.00,
        eH: 9.00,
        th: 234.00,
        gm: 46.83,
        pOcc: 444.33,
        tP: 11552.57,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.00, th: 130.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 246.85, tP: 6418.09, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 1, qty: 4, unit: 'Hr', eH: 4.00, th: 104.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 197.48, tP: 5134.47, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: '1st Spring Clean Up',
        occ: 1,
        comp: 0.00,
        eH: 9.00,
        th: 234.00,
        gm: 46.83,
        pOcc: 444.33,
        tP: 11552.57,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.00, th: 130.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 246.85, tP: 6418.09, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 1, qty: 4, unit: 'Hr', eH: 4.00, th: 104.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 197.48, tP: 5134.47, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: '2nd Fall Clean Up',
        occ: 1,
        comp: 0.00,
        eH: 9.00,
        th: 234.00,
        gm: 46.83,
        pOcc: 444.33,
        tP: 11552.57,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.00, th: 130.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 246.85, tP: 6418.09, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 1, qty: 4, unit: 'Hr', eH: 4.00, th: 104.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 197.48, tP: 5134.47, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Spring Color',
        occ: 1,
        comp: 0.00,
        eH: 10.00,
        th: 260.00,
        gm: 41.46,
        pOcc: 10014.10,
        tP: 260366.60,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.00, th: 130.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 246.85, tP: 6418.09, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Water In Plants', occ: 1, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 17.50, gm: 33.34, sP: 26.25, pOcc: 26.25, tP: 682.57, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Summer Color',
        occ: 1,
        comp: 0.00,
        eH: 14.00,
        th: 364.00,
        gm: 41.79,
        pOcc: 10213.26,
        tP: 265544.84,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.00, th: 130.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 246.85, tP: 6418.09, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 1, qty: 4, unit: 'Hr', eH: 4.00, th: 104.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 197.48, tP: 5134.47, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Water In Plants', occ: 1, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 17.50, gm: 33.34, sP: 26.25, pOcc: 26.25, tP: 682.57, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Fall Color',
        occ: 1,
        comp: 0.00,
        eH: 10.00,
        th: 260.00,
        gm: 41.46,
        pOcc: 10014.10,
        tP: 260366.60,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.00, th: 130.00, uP: 26.25, gm: 46.83, sP: 49.37, pOcc: 246.85, tP: 6418.09, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Water In Plants', occ: 1, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 17.50, gm: 33.34, sP: 26.25, pOcc: 26.25, tP: 682.57, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: '1st Turf App Pre-Emerg Crab, Broad & Fert',
        occ: 1,
        comp: 0.00,
        eH: 0.00,
        th: 0.00,
        gm: 40.84,
        pOcc: 1690.33,
        tP: 43948.61,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Sub-contractor/Owner', occ: 1, qty: 100, unit: 'Dollars', eH: 0.00, th: 0.00, uP: 100.00, gm: 40.84, sP: 1690.33, pOcc: 1690.33, tP: 43948.61, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: '2nd Turf App Pre-Emerg, Crab Broad & Fert Late Spring',
        occ: 1,
        comp: 0.00,
        eH: 0.00,
        th: 0.00,
        gm: 40.84,
        pOcc: 1690.33,
        tP: 43948.61,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Sub-contractor/Owner', occ: 1, qty: 100, unit: 'Dollars', eH: 0.00, th: 0.00, uP: 100.00, gm: 40.84, sP: 1690.33, pOcc: 1690.33, tP: 43948.61, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: '3rd Turf App Broadleaf and Fertilizer Early Summer',
        occ: 1,
        comp: 0.00,
        eH: 0.00,
        th: 0.00,
        gm: 40.84,
        pOcc: 1690.33,
        tP: 43948.61,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Sub-contractor/Owner', occ: 1, qty: 100, unit: 'Dollars', eH: 0.00, th: 0.00, uP: 100.00, gm: 40.84, sP: 1690.33, pOcc: 1690.33, tP: 43948.61, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: '4th Turf App Broadleaf and Fertilizer Late Summer',
        occ: 1,
        comp: 0.00,
        eH: 0.00,
        th: 0.00,
        gm: 40.84,
        pOcc: 1690.33,
        tP: 43948.61,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Sub-contractor/Owner', occ: 1, qty: 100, unit: 'Dollars', eH: 0.00, th: 0.00, uP: 100.00, gm: 40.84, sP: 1690.33, pOcc: 1690.33, tP: 43948.61, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: '5th Turf App Broadleaf and Fertilizer Early Fall',
        occ: 1,
        comp: 0.00,
        eH: 0.00,
        th: 0.00,
        gm: 40.84,
        pOcc: 1690.33,
        tP: 43948.61,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Sub-contractor/Owner', occ: 1, qty: 100, unit: 'Dollars', eH: 0.00, th: 0.00, uP: 100.00, gm: 40.84, sP: 1690.33, pOcc: 1690.33, tP: 43948.61, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Dormant Fertilizer Late Fall Turf App',
        occ: 1,
        comp: 0.00,
        eH: 0.00,
        th: 0.00,
        gm: 40.84,
        pOcc: 1690.33,
        tP: 43948.61,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Sub-contractor/Owner', occ: 1, qty: 100, unit: 'Dollars', eH: 0.00, th: 0.00, uP: 100.00, gm: 40.84, sP: 1690.33, pOcc: 1690.33, tP: 43948.61, comments: '' },
        ],
      },
    ],
  },
  {
    type: 'Category',
    name: 'Irrigation Services',
    gm: 79.87,
    tP: 70870.34,
    sections: [
      {
        type: 'Section',
        name: 'Irrigation System Start Up',
        occ: 1,
        comp: 10.00,
        eH: 6.60,
        th: 171.60,
        gm: 79.87,
        pOcc: 967.21,
        tP: 25147.54,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Irrigation', occ: 1, qty: 1, unit: 'Hr', eH: 1.10, th: 28.60, uP: 29.50, gm: 79.87, sP: 146.55, pOcc: 161.20, tP: 4191.26, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Irrigation Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.50, th: 143.00, uP: 29.50, gm: 79.87, sP: 146.55, pOcc: 806.01, tP: 20956.28, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Irrigation System Winterization',
        occ: 1,
        comp: 0.00,
        eH: 6.00,
        th: 156.00,
        gm: 79.87,
        pOcc: 879.28,
        tP: 22861.40,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Irrigation', occ: 1, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 29.50, gm: 79.87, sP: 146.55, pOcc: 146.55, tP: 3810.23, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Irrigation Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.00, th: 130.00, uP: 29.50, gm: 79.87, sP: 146.55, pOcc: 732.74, tP: 19051.17, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Seasonal Adjustment',
        occ: 1,
        comp: 0.00,
        eH: 6.00,
        th: 156.00,
        gm: 79.87,
        pOcc: 879.28,
        tP: 22861.40,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Irrigation', occ: 1, qty: 1, unit: 'Hr', eH: 1.00, th: 26.00, uP: 29.50, gm: 79.87, sP: 146.55, pOcc: 146.55, tP: 3810.23, comments: '' },
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Irrigation Travel', occ: 1, qty: 5, unit: 'Hr', eH: 5.00, th: 130.00, uP: 29.50, gm: 79.87, sP: 146.55, pOcc: 732.74, tP: 19051.17, comments: '' },
        ],
      },
    ],
  },
  {
    type: 'Category',
    name: 'Optional Services',
    gm: 42.42,
    tP: 102501.51,
    sections: [
      {
        type: 'Section',
        name: 'Turf Lime Treatment',
        occ: 1,
        comp: 0.00,
        eH: 0.00,
        th: 0.00,
        gm: 40.84,
        pOcc: 1690.33,
        tP: 43948.61,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Sub-contractor/Owner', occ: 1, qty: 1000, unit: 'Dollars', eH: 0.00, th: 0.00, uP: 1000.00, gm: 40.84, sP: 1690.33, pOcc: 1690.33, tP: 43948.61, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Aeration and Overseeding',
        occ: 1,
        comp: 0.00,
        eH: 4.00,
        th: 104.00,
        gm: 51.93,
        pOcc: 561.70,
        tP: 14604.28,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Labor-Maint', occ: 1, qty: 4, unit: 'Hr', eH: 4.00, th: 104.00, uP: 26.25, gm: 55.04, sP: 58.39, pOcc: 233.54, tP: 6072.06, comments: '' },
        ],
      },
      {
        type: 'Section',
        name: 'Soil Testing',
        occ: 1,
        comp: 0.00,
        eH: 0.00,
        th: 0.00,
        gm: 40.84,
        pOcc: 1690.33,
        tP: 43948.61,
        subSections: [
          { type: 'Sub-Section', category: 'Labor', name: 'Sub-contractor/Owner', occ: 1, qty: 1000, unit: 'Dollars', eH: 0.00, th: 0.00, uP: 1000.00, gm: 40.84, sP: 1690.33, pOcc: 1690.33, tP: 43948.61, comments: '' },
        ],
      },
    ],
  },
];


export default function EstimationPage({ showToast }) {
  // UserDatarALV4KUXG0V1K3Iissybc0YzYDq1/orders/-Ofxaog92ovGdVPEBeM5 -- Testing Estimations 
  // const location = useLocation();
  // const navigate = useNavigate();
  const [property, setProperty] = useState({ projectName: 'Sample Project', address: '123 Main St', date: '2025-07-09', area: '50,610 sqft' });
  const pageRef = useRef(null);
  const printRef = useRef(null);
  const [user, setUser] = useState(null);
  let projectID = property?.id;
  const [reference, setReference] = useState("")
  function getCookie(name) {
    let cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      let [key, value] = cookie.split("=");
      if (key === name) return decodeURIComponent(value);
    }
    return null;
  }
  useEffect(() => {
    if (!apiDb?.auth) return;
    const unsubscribe = apiDb.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser.uid);
        let references = getCookie("reference");
        if (!references) {
          alert("Select A Project And Come Back!");
          window.location.assign("/index.html");
        }
        setReference(references)
        // console.log('Current User ID:', currentUser.uid);
        console.log(`${references}/estimationsData`)
        const dbRefprojectName = apiDb.database().ref(`${references}`);
        dbRefprojectName.once("value", function (snapshot) {
          const data = snapshot.val();
          let obj = {
            projectName: data.projectName,
            date: data.timestamp.split("T")[0],
            address: data.searchlocation,
            workedGeojson: data.workedGeojson
          }
          setProperty(obj)
        })
        const dbRef = apiDb.database().ref(`${references}/estimationsData`);
        dbRef.once('value', (snapshot) => {
          const val = snapshot.val();
          console.log(val)
          if (val) {
            // console.log('Loaded estimationsData:', val);
            setTableData(val);
          } else {
            // console.log('No estimationsData found, using initialData');
            // setTableData(initialData);
          }
        }).catch((error) => {
          console.error('Error loading estimationsData:', error);
          showToast('Failed to load estimation data.', 'error');
        });
      } else {
        setUser(null);
        // console.log('No user signed in');
      }
    });
    return () => unsubscribe && unsubscribe();
  }, [projectID]);
  const handleSaveData = () => {
    if (!user) {
      showToast('Error: User not authenticated or project ID missing.', 'error');
      return;
    }
    let references = getCookie("reference");
    if (!references) {
      alert("Select A Project And Come Back!");
      window.location.assign("index.html");
    }
    console.log(`${references} saveing`)
    const dbRef = apiDb.database().ref(`${references}/estimationsData`);
    dbRef.set(tableData)
      .then(() => {
        showToast('Estimation data saved successfully!', 'success');
      })
      .catch((error) => {
        console.error('Error saving estimation data:', error);
        showToast('Failed to save estimation data.', 'error');
      });
  };

  const [newHeaderForm, setNewHeaderForm] = useState({
    headerName: '',
    sectionName: '',
    sectionOcc: 1,
    sectionComp: 0,
    selectedHeader: '',
  });
  const [newSubSectionForm, setNewSubSectionForm] = useState({
    selectedHeader: '',
    selectedSection: '',
    subSectionName: '',
    subSectionOcc: 1,
    subSectionComp: 0,
    subSectionUnit: 'Hr',
  });
  const [tableData, setTableData] = useState(initialData);
  const [showOfficePopup, setShowOfficePopup] = useState(false);
  const [showHeaderPopup, setShowHeaderPopup] = useState(false);
  const [showSubSectionPopup, setShowSubSectionPopup] = useState(false);
  const [exportAction, setExportAction] = useState('');
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);
  const [isSummaryMinimized, setIsSummaryMinimized] = useState(false);
  const [officeDetails, setOfficeDetails] = useState({
    logo: null,
    companyName: '',
    phone: '',
    address: '',
    email: ''
  });
  const [expandedHeaders, setExpandedHeaders] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  //const [netProfit, setNetProfit] = useState(0.12); // Default 12%
  //const [salesTaxRate, setSalesTaxRate] = useState(0.05); // Default 5%
  //const [taxPrice, setTaxPrice] = useState(0);

  const [salesTaxRate, setSalesTaxRate] = useState(0.05);
  const [salesTaxInput, setSalesTaxInput] = useState("5.0");
  const [taxPrice, setTaxPrice] = useState("$0.00");
  const [netProfit, setNetProfit] = useState(0.12);

  // Calculate E/H based on item name
  const calculateEH = (name, qty, sectionComp, unit, addlComp = 0) => {
    if ([
      'Black Dyed Mulch @ 1"', 'Black Dyed Mulch @ 2"', 'Black Dyed Mulch @ 3"',
      'Brown Dyed Mulch @ 1"', 'Brown Dyed Mulch @ 2"', 'Brown Dyed Mulch @ 3"',
      'Red Dyed Mulch @ 1"', 'Red Dyed Mulch @ 2"', 'Red Dyed Mulch @ 3"',
      'Triple Ground Mulch @ 1"'
    ].includes(name)) {
      return 0;
    }
    if (unit === 'Dollars') {
      return 0; // E/H always 0 for Dollar unit
    }

    if (name === 'Fine Turf Mowing - 30"') {
      return (qty / 7267) * (1 + sectionComp + (addlComp / 100));
    }
    if (name === 'Fine Turf Mowing - 48"') {
      return (qty / 21800) * (1 + sectionComp + (addlComp / 100));
    }
    if (name === 'Fine Turf Mowing - 60"') {
      return (qty / 43554) * (1 + sectionComp + (addlComp / 100));
    }
    if (['Hr', 'Sqft'].includes(unit)) {
      // console.log(qty * (1 + (sectionComp / 100)))
      return qty * (1 + (sectionComp / 100));
    }
    return 0;
  };


  useEffect(() => {
    const geojsonFromDB = property?.workedGeojson || null;
    if (geojsonFromDB) {
      const featureType = geojsonFromDB.features;
      let turf30Area = 0;
      let turf48Area = 0;
      let turf60Area = 0;
      let totalMulchBedsArea = 0;
      featureType.forEach((feature) => {
        const layerType = feature.properties.layerType || feature.properties.featureType;
        const measurement = parseFloat(feature.properties.measurement) || 0;

        if (layerType === 'turf30') {
          // console.log(layerType, measurement);
          turf30Area += measurement;
        } else if (layerType === 'turf48') {
          turf48Area += measurement;
        } else if (layerType === 'turf60') {
          turf60Area += measurement;
        } else if (layerType === 'mulchBeds') {
          totalMulchBedsArea += measurement;
        }
      });
      setTableData((prevData) => {
        return prevData.map((category) => {
          if (category.name === 'Maintenance Services Contract') {
            return {
              ...category,
              sections: category.sections.map((section) => {
                if (section.name === 'Fine Turf Mowing') {
                  return {
                    ...section,
                    subSections: section.subSections.map((subSection) => {
                      let newQty = subSection.qty;
                      let newEH, newPOcc, newTP;
                      if (subSection.name === 'Fine Turf Mowing - 30"' && turf30Area) {
                        newQty = turf30Area;
                        newEH = calculateEH(subSection.name, newQty, subSection.comp);
                        newPOcc = newQty * subSection.sP;
                        newTP = newPOcc * subSection.occ;
                        return {
                          ...subSection,
                          qty: newQty,
                          eH: parseFloat(newEH.toFixed(2)),
                          th: parseFloat((newEH * subSection.occ).toFixed(2)),
                          pOcc: parseFloat(newPOcc.toFixed(2)),
                          tP: parseFloat(newTP.toFixed(2)),
                        };
                      } else if (subSection.name === 'Fine Turf Mowing - 48"' && turf48Area) {
                        newQty = turf48Area;
                        newEH = calculateEH(subSection.name, newQty, subSection.comp);
                        newPOcc = newQty * subSection.sP;
                        newTP = newPOcc * subSection.occ;
                        return {
                          ...subSection,
                          qty: newQty,
                          eH: parseFloat(newEH.toFixed(2)),
                          th: parseFloat((newEH * subSection.occ).toFixed(2)),
                          pOcc: parseFloat(newPOcc.toFixed(2)),
                          tP: parseFloat(newTP.toFixed(2)),
                        };
                      } else if (subSection.name === 'Fine Turf Mowing - 60"' && turf60Area) {
                        newQty = turf60Area;
                        newEH = calculateEH(subSection.name, newQty, subSection.comp);
                        newPOcc = newQty * subSection.sP;
                        newTP = newPOcc * subSection.occ;
                        return {
                          ...subSection,
                          qty: newQty,
                          eH: parseFloat(newEH.toFixed(2)),
                          th: parseFloat((newEH * subSection.occ).toFixed(2)),
                          pOcc: parseFloat(newPOcc.toFixed(2)),
                          tP: parseFloat(newTP.toFixed(2)),
                        };
                      }
                      return subSection;
                    }),
                  };
                }
                if (section.name === 'Spring Mulch' && totalMulchBedsArea) {
                  return {
                    ...section,
                    subSections: section.subSections.concat([
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Black Dyed Mulch @ 1"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 1) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 1) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 1) / 324) * 26.14 * 26).toFixed(2)),
                        comments: '',
                      },
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Black Dyed Mulch @ 2"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 2) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 2) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 2) / 324) * 26.14 * 26).toFixed(2)),
                        comments: '',
                      },
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Black Dyed Mulch @ 3"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 3) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 3) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 3) / 324) * 26.14 * 26).toFixed(2)),
                        comments: '',
                      },
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Brown Dyed Mulch @ 1"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 1) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 1) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 1) / 324) * 26.14 * 26).toFixed(2)),
                        comments: '',
                      },
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Brown Dyed Mulch @ 2"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 2) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 2) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 2) / 324) * 26.14 * 26).toFixed(2)),
                        comments: '',
                      },
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Brown Dyed Mulch @ 3"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 3) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 3) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 3) / 324) * 26.14 * 26).toFixed(2)),
                        comments: '',
                      },
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Red Dyed Mulch @ 1"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 1) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 1) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 1) / 324) * 26.14 * 26).toFixed(2)),
                        comments: '',
                      },
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Red Dyed Mulch @ 2"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 2) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 2) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 2) / 324) * 26.14 * 26).toFixed(2)),
                        comments: '',
                      },
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Red Dyed Mulch @ 3"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 3) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 3) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 3) / 324) * 26.14 * 26).toFixed(2)),
                        comments: '',
                      },
                      {
                        type: 'Sub-Section',
                        category: 'Material',
                        name: 'Triple Ground Mulch @ 1"',
                        occ: 26,
                        qty: parseFloat(((totalMulchBedsArea * 3) / 324).toFixed(2)),
                        unit: 'cu. yd.',
                        eH: 0,
                        th: 0,
                        uP: 26.14,
                        gm: 0.00,
                        sP: 26.14,
                        pOcc: parseFloat((((totalMulchBedsArea * 3) / 324) * 26.14).toFixed(2)),
                        tP: parseFloat((((totalMulchBedsArea * 3) / 324) * 26.14 * 26).toFixed(2)),
                        comments: 'Assuming 3" depth per provided formula; confirm if 1" depth is intended',
                      },
                    ]),
                  };
                }
                return section;
              }),
            };
          }
          return category;
        });
      });

    } else {
      // console.log('No geojson data available, keeping initialData unchanged.');
      property.area = '';
    }
  }, [property]);
  useEffect(() => {
    setTableData(prevData =>
      prevData.map(header => {
        return {
          ...header,
          sections: header.sections.map(section => {
            const updatedOcc = parseInt(section.occ) >= 0 ? parseInt(section.occ) : 0; // Ensure non-negative occ
            let updatedSubSections = section.subSections.map(sub => {
              const isLaborUnit = ['Hr', 'Sqft'].includes(sub.unit);
              const isFineTurfMowing = section.name === 'Fine Turf Mowing' && [
                'Fine Turf Mowing - 30"',
                'Fine Turf Mowing - 48"',
                'Fine Turf Mowing - 60"'
              ].includes(sub.name);

              let newEH = calculateEH(sub.name, sub.qty, section.comp, sub.unit, sub.addlComp || 0);
              let newSP = sub.uP / (1 - (sub.gm / 100)) || 0;
              let newPOcc;

              if (sub.unit === 'Dollars') {
                newEH = 0;
                newPOcc = newSP; // P/Occ = S/P
              } else if (isFineTurfMowing) {
                newPOcc = newEH * newSP;
              } else if (isLaborUnit) {
                newPOcc = newEH * newSP;
              } else {
                newPOcc = newSP * (sub.qty || 0);
              }

              if (sub.name === 'Fine Turf Mowing - 30"') {
                // console.log(`Fine Turf Mowing - 30": newEH=${newEH.toFixed(2)}, newSP=${newSP.toFixed(2)}, basePOcc=${(newEH * newSP).toFixed(2)}, newPOcc=${newPOcc.toFixed(2)}`);
              }

              const updatedSub = {
                ...sub,
                // Remove: occ: updatedOcc, // Do NOT sync subsection occ with section occ
                eH: parseFloat(newEH.toFixed(2)),
                th: sub.unit === 'Dollars' ? 0 : (isLaborUnit ? parseFloat((newEH * sub.occ).toFixed(2)) : 0), // Use sub.occ instead of updatedOcc
                sP: newSP,
                pOcc: parseFloat(newPOcc.toFixed(2)),
                tP: parseFloat((newPOcc * sub.occ).toFixed(2)), // Use sub.occ instead of updatedOcc
              };
              // console.log(`Subsection ${sub.name}: eH=${updatedSub.eH}, th=${updatedSub.th}, pOcc=${updatedSub.pOcc}, tP=${updatedSub.tP}, gm=${updatedSub.gm}%`); // Debug
              return updatedSub;
            });

            const validSubSections = updatedSubSections.filter((sub) => (sub.gm || 0) > 0 && (sub.tP || 0) > 0);
            const sectionTotalTH = updatedOcc === 0 ? 0 : updatedSubSections.reduce((sum, sub) => sum + (sub.th || 0), 0);
            const sectionTotalEH = section.occ === 0 ? 0 : sectionTotalTH / section.occ;
            const sectionTotalTP = updatedOcc === 0 ? 0 : validSubSections.reduce((sum, sub) => sum + (sub.tP || 0), 0);
            const sectionTotalPOcc = section.occ === 0 ? 0 : sectionTotalTP / section.occ;
            const nonZeroSubSections = updatedSubSections.filter(sub => (parseFloat(sub.gm) || 0) !== 0);
            const nonZeroTotalTP = nonZeroSubSections.reduce((sum, sub) => sum + (parseFloat(sub.tP) || 0), 0);
            const sectionGM = nonZeroTotalTP
              ? updatedSubSections.reduce((sum, sub) => sum + ((parseFloat(sub.gm) || 0) * (parseFloat(sub.tP) || 0)), 0) / nonZeroTotalTP
              : 0;
            return {
              ...section,
              occ: updatedOcc,
              subSections: updatedSubSections,
              pOcc: sectionTotalPOcc,
              tP: sectionTotalTP,
              eH: sectionTotalEH,
              th: sectionTotalTH,
              gm: sectionGM,
            };
          }),
        };
      }).map(header => {
        const headerTP = header.sections.reduce((sum, section) => sum + (section.tP || 0), 0);
        const headerGM = headerTP
          ? header.sections.reduce((sum, section) => {
            const product = (section.gm || 0) * (section.tP || 0);
            const total = sum + product;
            return total;
          }, 0) / headerTP
          : 0;
        return {
          ...header,
          tP: headerTP,
          gm: headerGM,
        };
      })
    );
  }, [tableData]);

  useEffect(() => {
    const annualMaintenancePrice = calculateSummary().totalTP || 0;
    const tax = annualMaintenancePrice * salesTaxRate;
    setTaxPrice(
      `$${tax.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
  }, [salesTaxRate, tableData]);


  const calculateSummary = () => {
    let totalEH = 0;
    let totalTH = 0;
    let totalTP = 0;

    tableData.forEach(header => {
      if (header.name !== 'Optional Services') {
        header.sections.forEach(section => {
          totalEH += section.eH || 0;
          totalTH += section.th || 0;
          totalTP += section.tP || 0;
        });
      }
    });

    let grossMarginSum = 0;
    tableData.forEach((header) => {
      if (header.name !== 'Optional Services') {
        const gm = header.gm || 0;
        const tP = header.tP || 0;
        const product = (gm / 100) * tP;
        grossMarginSum += product;
      }
    });
    const grossMargin = totalTP ? (grossMarginSum / totalTP) * 100 : 0;

    const cogs = totalTP * (1 - grossMargin / 100);
    const breakEven = totalTP * (1 - netProfit);
    const overhead = breakEven - cogs;

    return {
      totalEH: totalEH ? totalEH.toFixed(2) : '0.00',
      totalTH: totalTH ? totalTH.toFixed(2) : '0.00',
      totalTP: totalTP || 0,
      grossMargin: grossMargin || 0, // Percentage (e.g., 43.16)
      breakEven: breakEven ? breakEven.toFixed(2) : '0.00',
      overhead: overhead ? overhead.toFixed(2) : '0.00',
      netProfit: netProfit || 0, // Decimal (e.g., 0.12)
      cogs: cogs ? cogs.toFixed(2) : '0.00',
    };
  };
  const addHeaderOrSection = () => {
    if (!newHeaderForm.sectionName) {
      alert('Please fill in the section name.');
      return;
    }
    if (!newHeaderForm.selectedHeader && !newHeaderForm.headerName) {
      alert('Please provide either a new header name or select an existing header.');
      return;
    }

    setTableData(prev => {
      if (newHeaderForm.selectedHeader) {
        // Add section to existing header
        return prev.map(header => {
          if (header.name === newHeaderForm.selectedHeader) {
            return {
              ...header,
              sections: [
                ...header.sections,
                {
                  type: 'Section',
                  name: newHeaderForm.sectionName,
                  occ: parseInt(newHeaderForm.sectionOcc) || 1,
                  comp: parseFloat(newHeaderForm.sectionComp) || 0,
                  eH: 0,
                  th: 0,
                  gm: 0,
                  pOcc: 0,
                  tP: 0,
                  subSections: [],
                },
              ],
            };
          }
          return header;
        });
      } else {
        // Add new header with section
        const newHeader = {
          type: 'Header',
          name: newHeaderForm.headerName,
          gm: 0,
          tP: 0,
          sections: [
            {
              type: 'Section',
              name: newHeaderForm.sectionName,
              occ: parseInt(newHeaderForm.sectionOcc) || 1,
              comp: parseFloat(newHeaderForm.sectionComp) || 0,
              eH: 0,
              th: 0,
              gm: 0,
              pOcc: 0,
              tP: 0,
              subSections: [],
            },
          ],
        };
        return [...prev, newHeader];
      }
    });
    setNewHeaderForm({ headerName: '', sectionName: '', sectionOcc: 1, sectionComp: 0, selectedHeader: '' });
    setShowHeaderPopup(false);
  };

  const addSubSection = () => {
    if (!newSubSectionForm.selectedHeader || !newSubSectionForm.selectedSection || !newSubSectionForm.subSectionName) {
      alert('Please select a header, section, and provide a sub-section name.');
      return;
    }
    setTableData(prev =>
      prev.map(header => {
        if (header.name === newSubSectionForm.selectedHeader) {
          return {
            ...header,
            sections: header.sections.map(section => {
              if (section.name === newSubSectionForm.selectedSection) {
                if (section.subSections.some(sub => sub.name === newSubSectionForm.subSectionName)) {
                  alert('Sub-section name already exists in this section. Please choose a unique name.');
                  return section;
                }
                const selectedItem = dataItems.find(item => item.name === newSubSectionForm.subSectionName) || {
                  unit: newSubSectionForm.subSectionUnit,
                  uP: parseFloat(newSubSectionForm.subSectionComp) || 0,
                  gm: 0,
                  qty: 1,
                  category: ['Hr', 'Sqft'].includes(newSubSectionForm.subSectionUnit) ? 'Labor' : 'Material'
                };
                const isLaborUnit = ['Hr', 'Sqft'].includes(newSubSectionForm.subSectionUnit);
                const isFineTurfMowing = section.name === 'Fine Turf Mowing' && [
                  'Fine Turf Mowing - 30"',
                  'Fine Turf Mowing - 48"',
                  'Fine Turf Mowing - 60"'
                ].includes(newSubSectionForm.subSectionName);
                const eH = calculateEH(newSubSectionForm.subSectionName, selectedItem.qty, section.comp, newSubSectionForm.subSectionUnit, isFineTurfMowing ? 0.00 : 0);
                const sP = selectedItem.uP / (1 - (selectedItem.gm / 100)) || 0;
                const basePOcc = isFineTurfMowing ? eH * sP : isLaborUnit ? eH * sP : sP * selectedItem.qty;
                const newPOcc = newSubSectionForm.subSectionName === 'Fine Turf Mowing - 30"' ? eH * 54.105 : basePOcc * (1 + 0.00);
                const newSubSection = {
                  type: 'Sub-Section',
                  category: isLaborUnit ? 'Labor' : 'Material',
                  name: newSubSectionForm.subSectionName,
                  occ: parseInt(newSubSectionForm.subSectionOcc) || 1,
                  qty: selectedItem.qty,
                  unit: newSubSectionForm.subSectionUnit,
                  eH: parseFloat(eH.toFixed(2)),
                  th: isLaborUnit ? parseFloat((eH * (parseInt(newSubSectionForm.subSectionOcc) || 1)).toFixed(2)) : 0,
                  uP: selectedItem.uP,
                  gm: selectedItem.gm || 0,
                  sP: sP,
                  pOcc: parseFloat(newPOcc.toFixed(2)),
                  tP: parseFloat((newPOcc * (parseInt(newSubSectionForm.subSectionOcc) || 1)).toFixed(2)),
                  addlComp: isFineTurfMowing ? 0.00 : undefined,
                  comments: '',
                };
                const updatedSubSections = [...section.subSections, newSubSection];
                const sectionTotalPOcc = updatedSubSections.reduce((sum, sub) => sum + (sub.pOcc || 0), 0);
                const sectionTotalEH = updatedSubSections.reduce((sum, sub) => sum + (sub.eH || 0), 0);
                const sectionTotalTH = updatedSubSections.reduce((sum, sub) => sum + (sub.th || 0), 0);
                const sectionTotalTP = sectionTotalPOcc * section.occ;
                const sectionGM = sectionTotalTP ? updatedSubSections.reduce((sum, sub) => sum + ((sub.gm || 0) * (sub.tP || 0)), 0) / sectionTotalTP : 0;
                return {
                  ...section,
                  subSections: updatedSubSections,
                  pOcc: sectionTotalPOcc,
                  tP: sectionTotalTP,
                  eH: sectionTotalEH,
                  th: sectionTotalTH,
                  gm: sectionGM,
                };
              }
              return section;
            }),
          };
        }
        return header;
      }).map(header => {
        const sectionTotalTP = header.sections.reduce((sum, section) => sum + (section.tP || 0), 0);
        const headerGM = sectionTotalTP ? header.sections.reduce((sum, section) => sum + ((section.gm || 0) * (section.tP || 0)), 0) / sectionTotalTP : 0;
        return { ...header, tP: sectionTotalTP, gm: headerGM };
      })
    );
    setNewSubSectionForm({ selectedHeader: '', selectedSection: '', subSectionName: '', subSectionOcc: 1, subSectionComp: 0, subSectionUnit: 'Hr' });
    setShowSubSectionPopup(false);
  };
  // New function
  const deleteHeader = (headerId) => {
    setTableData(prevData => prevData.filter(header => header.name !== headerId));
  };
  // New function
  const deleteSection = (headerId, sectionId) => {
    setTableData(prevData =>
      prevData.map(header => {
        if (header.name !== headerId) return header;
        const updatedSections = header.sections.filter(section => section.name !== sectionId);
        const sectionTotalPOcc = updatedSections.reduce((sum, section) => sum + section.pOcc, 0);
        const sectionTotalTP = updatedSections.reduce((sum, section) => sum + section.tP, 0);
        const sectionGM = updatedSections.reduce((sum, section) => sum + section.subSections.reduce((ss, sub) => ss + (sub.gm * sub.tP), 0), 0) / sectionTotalTP || 0;
        return {
          ...header,
          sections: updatedSections,
          tP: sectionTotalTP,
          gm: sectionGM,
        };
      }).filter(header => header.sections.length > 0)
    );
  };

  const handleInputChange = (headerId, sectionId, subSectionId, field, value) => {
    setTableData(prevData =>
      prevData.map(header => {
        if (header.name === headerId) {
          return {
            ...header,
            sections: header.sections.map(section => {
              if (section.name === sectionId) {
                if (!subSectionId) {
                  const updatedSection = { ...section, [field]: parseFloat(value) || 0 };
                  let updatedSubSections = updatedSection.subSections;
                  if (field === 'occ') {
                    updatedSubSections = updatedSection.subSections.map(sub => ({
                      ...sub,
                      occ: parseFloat(value) || 0, 
                    }));
                  }
                  updatedSubSections = updatedSubSections.map(sub => {
                    const isFineTurfMowing = section.name === 'Fine Turf Mowing' && [
                      'Fine Turf Mowing - 30"',
                      'Fine Turf Mowing - 48"',
                      'Fine Turf Mowing - 60"'
                    ].includes(sub.name);
                    if (isFineTurfMowing) {
                      const newEH = calculateEH(sub.name, sub.qty, updatedSection.comp, sub.unit, sub.addlComp || 0);
                      const newSP = sub.uP / (1 - (sub.gm / 100)) || 0;
                      const basePOcc = newEH * newSP; 
                      const newPOcc = sub.name === 'Fine Turf Mowing - 30"' ? newEH * newSP : basePOcc;
                      return {
                        ...sub,
                        eH: parseFloat(newEH.toFixed(2)),
                        th: parseFloat((newEH * sub.occ).toFixed(2)),
                        sP: newSP,
                        pOcc: parseFloat(newPOcc.toFixed(2)),
                        tP: parseFloat((newPOcc * sub.occ).toFixed(2)),
                      };
                    }
                    return sub;
                  });
                  const sectionTotalPOcc = updatedSubSections.reduce((sum, sub) => sum + (sub.pOcc || 0), 0);
                  const sectionTotalEH = updatedSubSections.reduce((sum, sub) => sum + (sub.eH || 0), 0);
                  const sectionTotalTH = updatedSubSections.reduce((sum, sub) => sum + (sub.th || 0), 0);
                  const sectionTotalTP = sectionTotalPOcc * updatedSection.occ;
                  const sectionGM = sectionTotalTP
                    ? updatedSubSections.reduce((sum, sub) => sum + ((sub.gm || 0) * (sub.tP || 0)), 0) / sectionTotalTP
                    : 0;
                  return {
                    ...updatedSection,
                    subSections: updatedSubSections,
                    pOcc: sectionTotalPOcc,
                    tP: sectionTotalTP,
                    eH: sectionTotalEH,
                    th: sectionTotalTH,
                    gm: sectionGM,
                  };
                }
                // Update sub-section fields
                let updatedSubSections = section.subSections.map(sub => {
                  if (sub.name === subSectionId) {
                    const isLaborUnit = ['Hr', 'Sqft'].includes(sub.unit);
                    const isFineTurfMowing = section.name === 'Fine Turf Mowing' && [
                      'Fine Turf Mowing - 30"',
                      'Fine Turf Mowing - 48"',
                      'Fine Turf Mowing - 60"'
                    ].includes(sub.name);
                    let updatedSub = { ...sub, [field]: field === 'name' || field === 'unit' ? value : parseFloat(value) || 0 };
                    if (field === 'qty' && sub.unit === 'Dollars') {
                      updatedSub.uP = parseFloat(value) || 0;
                    }
                    if (field === 'qty' || field === 'uP' || field === 'gm' || field === 'addlComp') {
                      const newEH = calculateEH(sub.name, updatedSub.qty, section.comp, sub.unit, updatedSub.addlComp || 0);
                      const newSP = updatedSub.uP / (1 - (updatedSub.gm / 100)) || 0;
                      const basePOcc = isFineTurfMowing ? newEH * newSP : isLaborUnit ? newEH * newSP : newSP * updatedSub.qty;
                      const newPOcc = sub.name === 'Fine Turf Mowing - 30"' ? newEH * newSP : basePOcc;
                      updatedSub = {
                        ...updatedSub,
                        eH: parseFloat(newEH.toFixed(2)),
                        th: isLaborUnit ? parseFloat((newEH * updatedSub.occ).toFixed(2)) : 0,
                        sP: newSP,
                        pOcc: parseFloat(newPOcc.toFixed(2)),
                        tP: parseFloat((newPOcc * updatedSub.occ).toFixed(2)),
                      };
                    }
                    return updatedSub;
                  }
                  return sub;
                });
                const sectionTotalPOcc = updatedSubSections.reduce((sum, sub) => sum + (sub.pOcc || 0), 0);
                const sectionTotalEH = updatedSubSections.reduce((sum, sub) => sum + (sub.eH || 0), 0);
                const sectionTotalTH = updatedSubSections.reduce((sum, sub) => sum + (sub.th || 0), 0);
                const sectionTotalTP = sectionTotalPOcc * section.occ;
                const sectionGM = sectionTotalTP
                  ? updatedSubSections.reduce((sum, sub) => sum + ((sub.gm || 0) * (sub.tP || 0)), 0) / sectionTotalTP
                  : 0;
                return {
                  ...section,
                  subSections: updatedSubSections,
                  pOcc: sectionTotalPOcc,
                  tP: sectionTotalTP,
                  eH: sectionTotalEH,
                  th: sectionTotalTH,
                  gm: sectionGM,
                };
              }
              return section;
            }),
          };
        }
        return header;
      }).map(header => {
        const sectionTotalTP = header.sections.reduce((sum, section) => sum + (section.tP || 0), 0);
        const headerGM = sectionTotalTP
          ? header.sections.reduce((sum, section) => sum + ((section.gm || 0) * (section.tP || 0)), 0) / sectionTotalTP
          : 0;
        return { ...header, tP: sectionTotalTP, gm: headerGM };
      })
    );
  };

  const handleHeaderFormChange = (field, value) => {
    setNewHeaderForm(prev => ({ ...prev, [field]: value }));
  };
  const handleSubSectionFormChange = (field, value) => {
    setNewSubSectionForm(prev => ({ ...prev, [field]: value }));
  };
  // Add sub-item
  const addSubItem = (headerId, sectionId, selectedItem) => {
    if (!selectedItem) return;
    const itemData = selectedItem.data || { unit: 'Hr', uP: 26.25, gm: 0, eH: 0, qty: 1, category: 'Labor' };
    setTableData(prevData =>
      prevData.map(header => {
        if (header.name !== headerId) return header;
        return {
          ...header,
          sections: header.sections.map(section => {
            if (section.name !== sectionId) return section;
            const newSubSection = {
              type: 'Sub-Section',
              category: itemData.category,
              name: selectedItem.value,
              occ: section.occ || 1,
              qty: itemData.qty,
              unit: itemData.unit,
              eH: calculateEH(selectedItem.value, itemData.qty, section.comp),
              th: calculateEH(selectedItem.value, itemData.qty, section.comp) * (section.occ || 1),
              uP: itemData.uP,
              gm: itemData.gm,
              sP: itemData.uP / (1 - (itemData.gm / 100)) || 0,
              pOcc: itemData.category === 'Labor'
                ? calculateEH(selectedItem.value, itemData.qty, section.comp) * (itemData.uP / (1 - (itemData.gm / 100)))
                : (itemData.uP / (1 - (itemData.gm / 100))) * itemData.qty,
              tP: (itemData.category === 'Labor'
                ? calculateEH(selectedItem.value, itemData.qty, section.comp) * (itemData.uP / (1 - (itemData.gm / 100)))
                : (itemData.uP / (1 - (itemData.gm / 100))) * itemData.qty) * (section.occ || 1),
              comments: '',
            };
            const updatedSubSections = [...section.subSections, newSubSection];
            const sectionTotalPOcc = updatedSubSections.reduce((sum, sub) => sum + sub.pOcc, 0);
            const sectionTotalEH = updatedSubSections.reduce((sum, sub) => sum + sub.eH, 0);
            const sectionTotalTH = updatedSubSections.reduce((sum, sub) => sum + sub.th, 0);
            const sectionGM = updatedSubSections.reduce((sum, sub) => sum + (sub.gm * sub.tP), 0) / (sectionTotalPOcc * section.occ) || 0;
            return {
              ...section,
              subSections: updatedSubSections,
              pOcc: sectionTotalPOcc,
              tP: sectionTotalPOcc * section.occ,
              eH: sectionTotalEH,
              th: sectionTotalTH,
              gm: sectionGM,
            };
          }).map(section => ({
            ...section,
            gm: section.subSections.reduce((sum, sub) => sum + (sub.gm * sub.tP), 0) / section.tP || 0,
          }))
        };
      }).map(header => ({
        ...header,
        tP: header.sections.reduce((sum, section) => sum + section.tP, 0),
        gm: header.sections.reduce((sum, section) => sum + section.subSections.reduce((ss, sub) => ss + (sub.gm * sub.tP), 0), 0) /
          header.sections.reduce((sum, section) => sum + section.tP, 0) || 0,
      }))
    );
  };

  // Delete sub-item
  const deleteSubItem = (headerId, sectionId, subSectionId) => {
    setTableData(prevData =>
      prevData.map(header => {
        if (header.name !== headerId) return header;
        return {
          ...header,
          sections: header.sections.map(section => {
            if (section.name !== sectionId) return section;
            const updatedSubSections = section.subSections.filter(sub => sub.name !== subSectionId);
            const sectionTotalPOcc = updatedSubSections.reduce((sum, sub) => sum + sub.pOcc, 0);
            const sectionTotalEH = updatedSubSections.reduce((sum, sub) => sum + sub.eH, 0);
            const sectionTotalTH = updatedSubSections.reduce((sum, sub) => sum + sub.th, 0);
            const sectionGM = updatedSubSections.reduce((sum, sub) => sum + (sub.gm * sub.tP), 0) / (sectionTotalPOcc * section.occ) || 0;
            return {
              ...section,
              subSections: updatedSubSections,
              pOcc: sectionTotalPOcc,
              tP: sectionTotalPOcc * section.occ,
              eH: sectionTotalEH,
              th: sectionTotalTH,
              gm: sectionGM,
            };
          }).map(section => ({
            ...section,
            gm: section.subSections.reduce((sum, sub) => sum + (sub.gm * sub.tP), 0) / section.tP || 0,
          }))
        };
      }).map(header => ({
        ...header,
        tP: header.sections.reduce((sum, section) => sum + section.tP, 0),
        gm: header.sections.reduce((sum, section) => sum + section.subSections.reduce((ss, sub) => ss + (sub.gm * sub.tP), 0), 0) /
          header.sections.reduce((sum, section) => sum + section.tP, 0) || 0,
      }))
    );
  }; 
  const toggleHeaderExpansion = (headerId) => {
    setExpandedHeaders(prev => {
      const newState = { ...prev, [headerId]: !prev[headerId] };
      if (!newState[headerId]) {
        const header = tableData.find(h => h.name === headerId);
        if (header) {
          header.sections.forEach(section => {
            setExpandedSections(prevSections => ({
              ...prevSections,
              [section.name]: false
            }));
          });
        }
      }
      return newState;
    });
  }; 
  const toggleSectionExpansion = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
 


  const handleExportAction = (action) => {
    setExportAction(action);
    setShowOfficePopup(true);
  }; 
  const handleOfficePopupSubmit = (officeDetailsData) => {
    setOfficeDetails(prev => ({ ...prev, ...officeDetailsData }));
    setShowOfficePopup(false);
    handleDownloadPDF();
  };
 
  const handleDownloadPNG = async () => {
    if (!printRef.current) {
      alert('Cannot download PNG. Please ensure the page is loaded.');
      return;
    }

    try {
      setShowOfficePopup(false);
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1400,
        height: printRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        allowTaint: true,
        foreignObjectRendering: true
      });

      const link = document.createElement('a');
      link.download = `${property.projectName || property.address}-estimation.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Failed to generate PNG. Please try again.');
    } finally {
      if (exportAction) setShowOfficePopup(true);
    }
  };
 
  const handleDownloadPDF = () => {
    try {
      setShowOfficePopup(false);

      const summary = calculateSummary(); 
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      let yOffset = 10;
 
      if (officeDetails.logo) {
        try { 
          const img = new Image();
          img.src = officeDetails.logo;
          return new Promise((resolve) => {
            img.onload = () => {
              const maxWidth = 40;  
              const maxHeight = 20; 
              let imgWidth = img.naturalWidth;
              let imgHeight = img.naturalHeight;

              // Maintain aspect ratio
              const aspectRatio = imgWidth / imgHeight;
              if (imgWidth > maxWidth) {
                imgWidth = maxWidth;
                imgHeight = imgWidth / aspectRatio;
              }
              if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = imgHeight * aspectRatio;
              }
 
              doc.addImage(officeDetails.logo, 'PNG', margin, yOffset, imgWidth, imgHeight);
              yOffset += imgHeight + 4;  
              resolve();
            };
          }).then(() => {
            // Continue with the rest of the PDF generation
            generatePDFContent(doc, pageWidth, margin, yOffset);
          });
        } catch (error) {
          console.warn('Error adding logo to PDF:', error);
          // Continue without logo
          generatePDFContent(doc, pageWidth, margin, yOffset);
        }
      } else {
        // No logo, proceed with PDF generation
        generatePDFContent(doc, pageWidth, margin, yOffset);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      if (exportAction) setShowOfficePopup(true);
    }
  };

  // Helper function to generate PDF content
  const generatePDFContent = (doc, pageWidth, margin, yOffset) => {
    // Add office details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(officeDetails.companyName || 'Your Company Name', margin, yOffset);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yOffset += 5;
    doc.text(officeDetails.phone || 'Phone: (555) 123-4567', margin, yOffset);
    yOffset += 5;
    doc.text(officeDetails.email || 'Email: contact@company.com', margin, yOffset);
    yOffset += 5;
    doc.text(officeDetails.address || 'Address: 123 Business St, City, State', margin, yOffset);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Project: ${property.projectName !== 'Unnamed Project' ? property.projectName : property.address}`,
      pageWidth - margin,
      yOffset - 20,
      { align: 'right' }
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Address: ${property.address}`, pageWidth - margin, yOffset - 10, { align: 'right' });
    doc.text(`Date: ${property.date}`, pageWidth - margin, yOffset - 5, { align: 'right' });
    doc.text(`Area: ${property.area}`, pageWidth - margin, yOffset, { align: 'right' });
    yOffset += 10;

    if (exportAction === 'pdf-client') {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Fixed Payment Services', margin, yOffset);
      yOffset += 10;

      const tableDataArray = [];
      tableData.forEach((header) => {
        tableDataArray.push([
          header.name,
          '',
          `$${header.tP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `$${header.tP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]);
        header.sections.forEach((section) => {
          tableDataArray.push([
            section.name,
            section.occ.toString(),
            `$${section.pOcc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            `$${section.tP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ]);
        });
      });

      // Calculate total table width for centering
      const columnWidths = [100, 30, 40, 40];
      const totalTableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      const leftMargin = (pageWidth - totalTableWidth) / 2; // Center the table

      autoTable(doc, {
        head: [['Description', 'Frequency', 'Cost per Occ.', 'Annual Cost']],
        body: tableDataArray,
        startY: yOffset,
        theme: 'grid',
        headStyles: { fillColor: [243, 244, 246], textColor: [55, 65, 81], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' },
        },
        styles: { cellPadding: 2, font: 'helvetica' },
        margin: { left: leftMargin, right: leftMargin }, // Center the table
        didParseCell: (data) => {
          if (data.row.section === 'body') {
            const rowData = tableDataArray[data.row.index];
            if (tableData.some((header) => header.name === rowData[0])) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [255, 255, 255];
              data.cell.styles.textColor = [31, 147, 82];
            }
          }
        },
      });

      yOffset = doc.lastAutoTable.finalY + 10;

      // Payment Summary
      const annualMaintenancePrice = summary.totalTP || 0;
      const salesTax = annualMaintenancePrice * salesTaxRate;
      const totalPrice = annualMaintenancePrice + salesTax;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Summary', margin, yOffset);
      yOffset += 10;

      // Calculate total table width for Payment Summary
      const summaryColumnWidths = [100, 70]; // Approximate widths
      const totalSummaryTableWidth = summaryColumnWidths.reduce((sum, width) => sum + width, 0);
      const summaryLeftMargin = (pageWidth - totalSummaryTableWidth) / 2;

      autoTable(doc, {
        body: [
          [
            'Annual Maintenance Price',
            `$${annualMaintenancePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ],
          [
            'Sales Tax',
            `$${salesTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ],
          [
            'Total Price',
            `$${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ],
        ],
        startY: yOffset,
        theme: 'grid',
        bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto', halign: 'right' },
        },
        styles: { cellPadding: 2, font: 'helvetica' },
        margin: { left: summaryLeftMargin, right: summaryLeftMargin }, // Center the table
        didParseCell: (data) => {
          if (data.row.index === 2) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [31, 147, 82];
          }
        },
      });

      doc.save(`${property.projectName || property.address}-client-estimation.pdf`);
      showToast('PDF downloaded successfully!');
      setShowOfficePopup(false);

    } else {
      // Self PDF: Detailed Cost Breakdown
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Cost Breakdown', margin, yOffset);
      yOffset += 10;

      const tableDataArray = [];
      tableData.forEach((header) => {
        tableDataArray.push([
          header.type,
          header.name,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          header.gm.toFixed(2),
          '',
          '',
          `$${header.tP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]);
        header.sections.forEach((section) => {
          tableDataArray.push([
            section.type,
            section.name,
            section.occ.toString(),
            '',
            '',
            section.comp.toFixed(2),
            section.eH.toFixed(2),
            section.th.toFixed(2),
            '',
            section.gm.toFixed(2),
            '',
            `$${section.pOcc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            `$${section.tP.toLocaleString('en-US', { _quadrant: 2, maximumFractionDigits: 2 })}`,
          ]);
          section.subSections.forEach((sub) => {
            tableDataArray.push([
              sub.type,
              sub.name,
              sub.occ.toString(),
              sub.qty.toString(),
              sub.unit,
              section.comp.toFixed(2),
              sub.eH.toFixed(2),
              sub.th.toFixed(2),
              `$${sub.uP.toFixed(2)}`,
              `${sub.gm.toFixed(2)}%`,
              `$${sub.sP.toFixed(2)}`,
              `$${sub.pOcc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              `$${sub.tP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            ]);
          });
        });
      });

      // Calculate total table width for Detailed Cost Breakdown
      const detailedColumnWidths = [20, 50, 15, 15, 20, 15, 15, 15, 15, 15, 15, 20, 25];
      const totalDetailedTableWidth = detailedColumnWidths.reduce((sum, width) => sum + width, 0);
      const detailedLeftMargin = (pageWidth - totalDetailedTableWidth) / 2;

      autoTable(doc, {
        head: [['Type', 'Name', 'OCC', 'QTY', 'Unit', 'COMP (%)', 'E/H', 'TH', 'U/P ($)', 'GM (%)', 'S/P ($)', 'P/Occ ($)', 'T/P ($)']],
        body: tableDataArray,
        startY: yOffset,
        theme: 'grid',
        headStyles: { fillColor: [243, 244, 246], textColor: [55, 65, 81], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 50 },
          2: { cellWidth: 15 },
          3: { cellWidth: 15 },
          4: { cellWidth: 20 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 15 },
          8: { cellWidth: 15 },
          9: { cellWidth: 15 },
          10: { cellWidth: 15 },
          11: { cellWidth: 20 },
          12: { cellWidth: 25 },
        },
        styles: { cellPadding: 1, font: 'helvetica' },
        margin: { left: detailedLeftMargin, right: detailedLeftMargin }, // Center the table
        didParseCell: (data) => {
          if (data.row.section === 'body') {
            const rowData = tableDataArray[data.row.index];
            if (rowData[0] === 'Category' || rowData[0] === 'Header') {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [255, 255, 255];
              data.cell.styles.textColor = [31, 147, 82];
            } else if (rowData[0] === 'Section') {
              data.cell.styles.fontStyle = 'normal';
              data.cell.styles.fillColor = [243, 244, 246];
            } else if (rowData[0] === 'Sub-Section') {
              data.cell.styles.textColor = [75, 85, 99];
              data.cell.styles.fontStyle = 'italic';
            }
            if (data.column.index === 9 && (rowData[0] === 'Category' || rowData[0] === 'Header' || rowData[0] === 'Section')) {
              data.cell.styles.textColor = [37, 99, 235];
            }
            if (data.column.index === 12) {
              data.cell.styles.textColor = [31, 147, 82];
            }
          }
        },
        foot: [
          [
            { content: 'Total Project Cost:', colSpan: 12, styles: { halign: 'right', fillColor: [31, 147, 82], textColor: [255, 255, 255], fontStyle: 'bold' } },
            { content: `$${summary.totalTP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { textColor: [255, 255, 255], fontStyle: 'bold' } },
          ],
        ],
      });

      yOffset = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Summary', margin, yOffset);
      yOffset += 10;

      // Calculate total table width for Project Summary
      const projectSummaryColumnWidths = [100, 70]; // Approximate widths
      const totalProjectSummaryTableWidth = projectSummaryColumnWidths.reduce((sum, width) => sum + width, 0);
      const projectSummaryLeftMargin = (pageWidth - totalProjectSummaryTableWidth) / 2;

      autoTable(doc, {
        body: [
          ['Overhead:', `$${summary.overhead.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Break Even:', `$${summary.breakEven.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Net Profit Margin:', `${(summary.netProfit * 100).toFixed(2)}%`],
          ['Gross Margin:', `${(summary.grossMargin * 100).toFixed(2)}%`],
          ['Total Project Cost:', `$${summary.totalTP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ],
        startY: yOffset,
        theme: 'grid',
        bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto', halign: 'right' },
        },
        styles: { cellPadding: 1, font: 'helvetica' },
        margin: { left: projectSummaryLeftMargin, right: projectSummaryLeftMargin }, // Center the table
        didParseCell: (data) => {
          if (data.row.index === 2) {
            data.cell.styles.textColor = [22, 163, 74];
          } else if (data.row.index === 3) {
            data.cell.styles.textColor = [37, 99, 235];
          } else if (data.row.index === 4) {
            data.cell.styles.textColor = [31, 147, 82];
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      doc.save(`${property.projectName || property.address}-estimation.pdf`);
      showToast('PDF downloaded successfully!');
      setShowOfficePopup(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOfficeDetails(prev => ({ ...prev, logo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Property Data</h2>
          <p className="text-gray-600 mb-6">Unable to load estimation data.</p>
          <button
            // onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-[#1F9352] to-[#056E9D] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const summary = calculateSummary();
  // console.log('summary in UI:', summary);
  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          /* Custom styles for react-select */
          .react-select__control {
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            padding: 0.25rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease-in-out;
          }
          .react-select__control:hover {
            border-color: #1F9352;
          }
          .react-select__control--is-focused {
            border-color: #1F9352;
            box-shadow: 0 0 0 3px rgba(31, 147, 82, 0.2);
            outline: none;
          }
          .react-select__menu {
            z-index: 10000;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            background-color: white;
            margin-top: 0.25rem;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
          }
          .react-select__option {
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
          }
          .react-select__option--is-focused {
            background-color: rgba(31, 147, 82, 0.1);
          }
          .react-select__option--is-selected {
            background-color: #1F9352;
            color: white;
          }
          .react-select__group-heading {
            font-size: 0.75rem;
            font-weight: 600;
            color: #374151;
            padding: 0.75rem 1rem;
            text-transform: uppercase;
            background-color: #f9fafb;
          }
          /* Animation for blob effect in modal */
          @keyframes blob {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          /* Sticky table header */
          th {
            position: sticky;
            top: 0; 
            z-index: 0 !important;
            background: linear-gradient(to right, #f3f4f6, #f9fafb);
            border-bottom: 2px solid #d1d5db;
          }
          /* Smooth transitions for table rows */
          tr {
            transition: background 0.3s ease-in-out;
          }
          /* Custom input styles */
          input, textarea {
            transition: all 0.2s ease-in-out;
          }
          input:focus, textarea:focus {
            box-shadow: 0 0 0 3px rgba(31, 147, 82, 0.2);
          }
          /* Modal animation */
          .modal-enter {
            opacity: 0;
            transform: scale(0.95);
          }
          .modal-enter-active {
            opacity: 1;
            transform: scale(1);
            transition: opacity 300ms, transform 300ms;
          }
          .modal-exit {
            opacity: 1;
            transform: scale(1);
          }
          .modal-exit-active {
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 300ms, transform 300ms;
          }
          /* Print styles */
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                // onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {property.projectName !== "Unnamed Project"
                    ? property.projectName
                    : property.address}
                </h1>
                <p className="text-sm text-gray-600">
                  Cost Estimation • {property.date}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowHeaderPopup(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-[#1F9352] to-[#056E9D] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Header/Section
              </button>
              <button
                onClick={() => setShowSubSectionPopup(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-[#056E9D] to-[#1F9352] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sub-Section
              </button>
              <button
                onClick={handleSaveData}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-[#056E9D] to-[#1F9352] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <div className="flex-1 lg:mr-80 p-6" ref={pageRef}>
          <div className="max-w-8xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#1F9352]/5 to-[#056E9D]/5">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detailed Cost Breakdown
                </h2>
                <p className="text-gray-600 mt-1">
                  Comprehensive project estimation with itemized costs
                </p>
              </div>
              <div className="relative overflow-visible">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px] border-separate border-spacing-0">
                    <thead className="overflow-visible">
                      <tr className="text-gray-700 font-semibold uppercase text-xs">
                        <th className="w-24 text-left py-4 px-4 relative group">
                          Type
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Type
                          </div>
                        </th>

                        <th className="w-64 text-left py-4 px-4 relative group">
                          Name
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Name
                          </div>
                        </th>
                        <th className="w-20 text-left py-4 px-4 relative group">
                          OCC
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Occerence
                          </div>
                        </th>
                        <th className="w-24 text-left py-4 px-4 relative group">
                          QTY
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Quantity
                          </div>
                        </th>
                        <th className="w-24 text-left py-4 px-4 relative group">
                          Unit
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Unit
                          </div>
                        </th>

                        <th className="w-20 text-left py-4 px-4 relative group">
                          COMP (%)
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Complexity
                          </div>
                        </th>

                        <th className="w-20 text-left py-4 px-4 relative group">
                          E/H
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Estimated Hours
                          </div>
                        </th>
                        <th className="w-20 text-left py-4 px-4 relative group">
                          TH
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Total Hours
                          </div>
                        </th>
                        <th className="w-24 text-left py-4 px-4 relative group">
                          U/P ($)
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Unit Price
                          </div>
                        </th>
                        <th className="w-20 text-left py-4 px-4 relative group">
                          GM (%)
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Gross Margin
                          </div>
                        </th>
                        <th className="w-24 text-left py-4 px-4 relative group">
                          S/P ($)
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Selling Price
                          </div>
                        </th>
                        <th className="w-28 text-left py-4 px-4 relative group ">
                          P/Occ ($)
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Price Per Occurrence
                          </div>
                        </th>
                        <th className="w-32 text-left py-4 px-4 relative group">
                          T/P ($)
                          <span className="inline-block ml-1 align-middle">
                            <Info className="w-4 h-4 text-gray-600 cursor-help" />
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap z-50 shadow-lg min-w-max">
                            Total Price
                          </div>
                        </th>
                        <th className="w-20 text-left py-4 px-4 no-print"> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((header, headerIndex) => (
                        <React.Fragment key={header.name}>
                          <tr
                            className={`${headerIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } hover:bg-gradient-to-r hover:from-[#1F9352]/5 hover:to-[#056E9D]/5 font-bold border-b border-gray-100 transition-colors duration-200`}
                          >
                            <td className="py-4 px-4 text-gray-900">
                              <button
                                onClick={() =>
                                  toggleHeaderExpansion(header.name)
                                }
                                className="flex items-center hover:text-[#1F9352] transition-colors duration-200 no-print"
                              >
                                {expandedHeaders[header.name] ? (
                                  <ChevronUp className="w-4 h-4 mr-2" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 mr-2" />
                                )}
                                {header.type}
                              </button>
                              <span className="print:inline hidden">
                                {header.type}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-900">
                              {header.name}
                            </td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4 text-blue-600 font-semibold">
                              {header.gm.toFixed(2)}
                            </td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4 text-[#1F9352] font-bold">
                              $
                              {header.tP.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="py-4 px-4 no-print">
                              <button
                                onClick={() => deleteHeader(header.name)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                aria-label="Delete Header"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          {(expandedHeaders[header.name] ||
                            (typeof window !== "undefined" &&
                              window.matchMedia &&
                              window.matchMedia("print").matches)) &&
                            header.sections.map((section, sectionIndex) => (
                              <React.Fragment key={section.name}>
                                <tr
                                  className={`${(headerIndex + sectionIndex) % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-50"
                                    } hover:bg-gradient-to-r hover:from-[#1F9352]/5 hover:to-[#056E9D]/5 border-b border-gray-100 transition-colors duration-200`}
                                >
                                  <td className="py-4 px-4 pl-8 text-gray-900 font-medium">
                                    <button
                                      onClick={() =>
                                        toggleSectionExpansion(section.name)
                                      }
                                      className="flex items-center hover:text-[#1F9352] transition-colors duration-200 no-print"
                                    >
                                      {expandedSections[section.name] ? (
                                        <ChevronUp className="w-4 h-4 mr-2" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 mr-2" />
                                      )}
                                      {section.type}
                                    </button>
                                    <span className="print:inline hidden pl-4">
                                      {section.type}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 pl-8 text-gray-900 font-medium">
                                    {section.name}
                                  </td>
                                  <td className="py-4 px-4">
                                    <input
                                      type="number"
                                      value={section.occ}
                                      onChange={(e) =>
                                        handleInputChange(
                                          header.name,
                                          section.name,
                                          null,
                                          "occ",
                                          e.target.value
                                        )
                                      }
                                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm no-print"
                                      min="0"
                                      step="1"
                                      aria-label="Section Occurrence"
                                    />
                                    <span className="print:inline hidden">
                                      {section.occ}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4"></td>
                                  <td className="py-4 px-4"></td>
                                  <td className="py-4 px-4">
                                    <input
                                      type="number"
                                      value={section.comp}
                                      onChange={(e) =>
                                        handleInputChange(
                                          header.name,
                                          section.name,
                                          null,
                                          "comp",
                                          e.target.value
                                        )
                                      }
                                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm no-print"
                                      min="0"
                                      step="0.1"
                                      aria-label="Section Complexity"
                                    />
                                    <span className="print:inline hidden">
                                      {section.comp.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-gray-700 font-medium">
                                    {section.eH.toFixed(2)}
                                  </td>
                                  <td className="py-4 px-4 text-gray-700 font-medium">
                                    {section.th.toFixed(2)}
                                  </td>
                                  <td className="py-4 px-4"></td>
                                  <td className="py-4 px-4 text-blue-600 font-semibold">
                                    {section.gm.toFixed(2)}
                                  </td>
                                  <td className="py-4 px-4"></td>
                                  <td className="py-4 px-4 font-semibold text-gray-900">
                                    $
                                    {section.pOcc.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="py-4 px-4 text-[#1F9352] font-bold">
                                    $
                                    {section.tP.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="py-4 px-4 no-print">
                                    <button
                                      onClick={() =>
                                        deleteSection(header.name, section.name)
                                      }
                                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                      aria-label="Delete Section"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                                {(expandedSections[section.name] ||
                                  (typeof window !== "undefined" &&
                                    window.matchMedia &&
                                    window.matchMedia("print").matches)) &&
                                  section.subSections.map((sub, subIndex) => (
                                    <tr
                                      key={`${section.name}-${sub.name}`}
                                      className="bg-gray-50 hover:bg-gradient-to-r hover:from-[#1F9352]/5 hover:to-[#056E9D]/5 transition-colors duration-200"
                                    >
                                      <td className="py-3 px-4 pl-12 text-gray-600 italic text-sm">
                                        {sub.type}
                                      </td>
                                      <td className="py-3 px-4 pl-12 text-gray-600 italic">
                                        <input
                                          type="text"
                                          value={sub.name}
                                          onChange={(e) =>
                                            handleInputChange(
                                              header.name,
                                              section.name,
                                              sub.name,
                                              "name",
                                              e.target.value
                                            )
                                          }
                                          className="w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm no-print"
                                          aria-label="Sub-Section Name"
                                        />
                                        <span className="print:inline hidden">
                                          {sub.name}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <input
                                          type="number"
                                          value={sub.occ}
                                          onChange={(e) =>
                                            handleInputChange(
                                              header.name,
                                              section.name,
                                              sub.name,
                                              "occ",
                                              e.target.value
                                            )
                                          }
                                          className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm no-print"
                                          min="0"
                                          step="1"
                                          aria-label="Sub-Section Occurrence"
                                        />
                                        <span className="print:inline hidden">
                                          {sub.occ}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <input
                                          type="number"
                                          value={sub.qty}
                                          onChange={(e) =>
                                            handleInputChange(
                                              header.name,
                                              section.name,
                                              sub.name,
                                              "qty",
                                              e.target.value
                                            )
                                          }
                                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm no-print"
                                          min="0"
                                          step="1"
                                          aria-label="Sub-Section Quantity"
                                        />
                                        <span className="print:inline hidden">
                                          {sub.qty}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <input
                                          type="text"
                                          value={sub.unit}
                                          onChange={(e) =>
                                            handleInputChange(
                                              header.name,
                                              section.name,
                                              sub.name,
                                              "unit",
                                              e.target.value
                                            )
                                          }
                                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm no-print"
                                          aria-label="Sub-Section Unit"
                                          disabled={true}
                                        />
                                        <span className="print:inline hidden">
                                          {sub.unit}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        {section.name === "Fine Turf Mowing" &&
                                          [
                                            'Fine Turf Mowing - 30"',
                                            'Fine Turf Mowing - 48"',
                                            'Fine Turf Mowing - 60"'
                                          ].includes(sub.name) ? (
                                          <>
                                            <input
                                              type="number"
                                              value={sub.addlComp || 0}
                                              onChange={(e) =>
                                                handleInputChange(
                                                  header.name,
                                                  section.name,
                                                  sub.name,
                                                  "addlComp",
                                                  e.target.value
                                                )
                                              }
                                              className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm no-print"
                                              min="0"
                                              step="0.1"
                                              aria-label="Sub-Section Additional Complexity"
                                            />
                                            <span className="print:inline hidden">
                                              {(sub.addlComp || 0).toFixed(2)}
                                            </span>
                                          </>
                                        ) : (
                                          <span>-</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-gray-600 font-medium">
                                        {sub.eH.toFixed(2)}
                                      </td>
                                      <td className="py-3 px-4 text-gray-600 font-medium">
                                        {sub.th.toFixed(2)}
                                      </td>
                                      <td className="py-3 px-4">
                                        <input
                                          type="number"
                                          value={sub.uP}
                                          onChange={(e) =>
                                            handleInputChange(
                                              header.name,
                                              section.name,
                                              sub.name,
                                              "uP",
                                              e.target.value
                                            )
                                          }
                                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm no-print"
                                          min="0"
                                          step="1"
                                          aria-label="Sub-Section Cost per Unit"
                                          disabled={sub.unit === "Dollars"}
                                        />
                                        <span className="print:inline hidden">
                                          ${(sub.uP || 0).toFixed(2)}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <input
                                          type="number"
                                          value={sub.gm}
                                          onChange={(e) =>
                                            handleInputChange(
                                              header.name,
                                              section.name,
                                              sub.name,
                                              "gm",
                                              e.target.value
                                            )
                                          }
                                          className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm no-print"
                                          min="0"
                                          step="1"
                                          aria-label="Sub-Section Gross Margin"
                                        />
                                        <span className="print:inline hidden">
                                          {(sub.gm || 0).toFixed(2)}%
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-gray-700 font-medium">
                                        ${(sub.sP || 0).toFixed(2)}
                                      </td>
                                      <td className="py-3 px-4 text-gray-700 font-medium">
                                        $
                                        {(sub.pOcc || 0).toLocaleString(
                                          "en-US",
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-[#1F9352] font-semibold">
                                        $
                                        {(sub.tP || 0).toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </td>
                                      <td className="py-3 px-4 no-print">
                                        <button
                                          onClick={() =>
                                            deleteSubItem(
                                              header.name,
                                              section.name,
                                              sub.name
                                            )
                                          }
                                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                          aria-label="Delete Sub-Section"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                {expandedSections[section.name] && (
                                  <tr className="bg-gray-50 no-print">
                                    <td
                                      colSpan="14"
                                      className="py-4 px-4 pl-12"
                                    >
                                      <div className="flex items-center space-x-4">
                                        <div className="w-64">
                                          <Select
                                            options={groupedOptions}
                                            onChange={(selected) =>
                                              addSubItem(
                                                header.name,
                                                section.name,
                                                selected
                                              )
                                            }
                                            classNamePrefix="react-select"
                                            placeholder="Select item to add..."
                                            aria-label="Add Sub-Section"
                                          />
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#1F9352] bg-gray-100">
                        <td
                          colSpan="12"
                          className="py-4 px-4 text-right font-bold text-gray-900 text-lg"
                        >
                          Total Project Cost:
                        </td>
                        <td className="py-4 px-4 font-bold text-[#1F9352] text-xl">
                          $
                          {summary.totalTP.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-4 px-4 no-print"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="h-20"></div>
            </div>
          </div>
        </div>

        <>
          {!isSummaryMinimized && (
            <div className="w-[17%] bg-white shadow-xl border-t border-gray-200 fixed bottom-0 right-0 z-50 overflow-y-auto max-h-[90vh] lg:max-h-[88vh] no-print">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#1F9352]/5 to-[#056E9D]/5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Project Summary
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Financial overview and metrics
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setIsSummaryCollapsed(!isSummaryCollapsed);
                        const annualMaintenancePrice = summary.totalTP || 0;
                        const salesTax = annualMaintenancePrice * salesTaxRate;
                        setTaxPrice(
                          `$${salesTax.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        );
                      }}
                      className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                      aria-label={
                        isSummaryCollapsed
                          ? "Expand Project Summary"
                          : "Collapse Project Summary"
                      }
                    >
                      {isSummaryCollapsed ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {/* <button
                      onClick={() => setIsSummaryMinimized(true)}
                      className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                      aria-label="Minimize Project Summary"
                    >
                      <Minimize2 className="w-5 h-5" />
                    </button> */}
                  </div>
                </div>
              </div>
              {!isSummaryCollapsed && (
                <div className="p-6 space-y-6">
                  <div className="bg-gradient-to-r from-[#1F9352]/10 to-[#056E9D]/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      {/* <DollarSign className="w-5 h-5 text-[#1F9352] mr-2" /> */}
                      <h4 className="font-semibold text-gray-900 text-lg">
                        Total Project Cost
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-[#1F9352]">
                      $
                      {summary.totalTP.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-700">
                          Overhead :
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        $
                        {summary.overhead.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calculator className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-700">
                          Break Even:
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        $
                        {summary.breakEven.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 text-green-600 mr-2" />
                          <span className="font-medium text-green-700">
                            Net Profit Margin:
                          </span>
                        </div>
                        <span className="font-semibold text-green-600">
                          {(summary.netProfit * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-700">
                            Gross Margin:
                          </span>
                        </div>
                        <span className="font-semibold text-blue-600">
                          {summary.grossMargin.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 text-red-600 mr-2" />
                          <span className="font-medium text-red-700">Sales Tax:</span>
                        </div>
                        <span className="font-semibold text-red-600">{taxPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex gap-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-700">
                        Net Profit (%)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={netProfit * 100}
                        onChange={(e) =>
                          setNetProfit(parseFloat(e.target.value) / 100 || 0.12)
                        }
                        className="mt-1 w-32 p-2 border rounded focus:ring-[#056E9D] focus:border-[#056E9D]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">
                        Sales Tax (%)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        max="100"
                        value={salesTaxInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSalesTaxInput(val);
                          const parsed = parseFloat(val);
                          if (!isNaN(parsed)) {
                            setSalesTaxRate(parseFloat(parsed.toFixed(3)) / 100);
                          } else if (val === "") {
                            setSalesTaxRate(0);
                          }
                        }}
                        onBlur={() => {
                          const parsed = parseFloat(salesTaxInput);
                          if (isNaN(parsed)) {
                            setSalesTaxRate(0.05);
                            setSalesTaxInput("5.000");
                          } else {
                            const normalized = parseFloat(parsed.toFixed(3));
                            setSalesTaxRate(normalized / 100);
                            setSalesTaxInput(normalized.toFixed(3));
                          }
                        }}
                        className="mt-1 w-32 p-2 border rounded \
  focus:ring-[#056E9D] focus:border-[#056E9D]"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleExportAction("pdf")}
                      className="w-full flex items-center justify-center px-4 py-3 mt-2 bg-gradient-to-r from-[#056E9D] to-[#1F9352] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export to PDF (Self)
                    </button>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleExportAction("pdf-client")}
                      className="w-full flex items-center justify-center px-4 py-3 mt-2 bg-gradient-to-r from-[#056E9D] to-[#1F9352] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export to PDF (Client)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {isSummaryMinimized && (
            <button
              onClick={() => setIsSummaryMinimized(false)}
              className="fixed bottom-4 right-20 bg-gradient-to-r from-[#056E9D] to-[#1F9352] text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity duration-200"
              aria-label="Reopen Project Summary"
            >
              <Maximize2 className="w-5 h-5" text="Reopen Project Summary" />
            </button>
          )}
        </>
      </div>

      {/* Header/Section Popup */}
      {showHeaderPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative">
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#1F9352]/20 rounded-full -translate-x-12 -translate-y-12 animate-blob"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#056E9D]/20 rounded-full translate-x-12 -translate-y-12 animate-blob animation-delay-2000"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Add New Header or Section
                </h3>
                <button
                  onClick={() => setShowHeaderPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Close Popup"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Existing Header (Optional)
                  </label>
                  <Select
                    options={tableData.map((header) => ({
                      value: header.name,
                      label: header.name,
                    }))}
                    onChange={(selected) =>
                      handleHeaderFormChange(
                        "selectedHeader",
                        selected ? selected.value : ""
                      )
                    }
                    classNamePrefix="react-select"
                    placeholder="Select header to add section..."
                    isClearable
                    aria-label="Select Existing Header"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Header Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newHeaderForm.headerName}
                    onChange={(e) =>
                      handleHeaderFormChange("headerName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm"
                    placeholder="Enter new header name"
                    aria-label="Header Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Name
                  </label>
                  <input
                    type="text"
                    value={newHeaderForm.sectionName}
                    onChange={(e) =>
                      handleHeaderFormChange("sectionName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm"
                    placeholder="Enter section name"
                    aria-label="Section Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section OCC
                  </label>
                  <input
                    type="number"
                    value={newHeaderForm.sectionOcc}
                    onChange={(e) =>
                      handleHeaderFormChange("sectionOcc", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm"
                    min="1"
                    step="1"
                    placeholder="Enter occurrence"
                    aria-label="Section Occurrence"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section COMP (%)
                  </label>
                  <input
                    type="number"
                    value={newHeaderForm.sectionComp}
                    onChange={(e) =>
                      handleHeaderFormChange("sectionComp", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm"
                    min="0"
                    step="0.1"
                    placeholder="Enter complexity"
                    aria-label="Section Complexity"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowHeaderPopup(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={addHeaderOrSection}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-[#1F9352] to-[#056E9D] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                  aria-label="Add Header or Section"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Header or Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Section Popup */}
      {showSubSectionPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative">
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#1F9352]/20 rounded-full -translate-x-12 -translate-y-12 animate-blob"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#056E9D]/20 rounded-full translate-x-12 -translate-y-12 animate-blob animation-delay-2000"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Add Sub-Section
                </h3>
                <button
                  onClick={() => setShowSubSectionPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Close Popup"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Header
                  </label>
                  <Select
                    options={tableData.map((header) => ({
                      value: header.name,
                      label: header.name,
                    }))}
                    onChange={(selected) =>
                      handleSubSectionFormChange(
                        "selectedHeader",
                        selected ? selected.value : ""
                      )
                    }
                    value={
                      tableData.find(
                        (header) =>
                          header.name === newSubSectionForm.selectedHeader
                      )
                        ? {
                          value: newSubSectionForm.selectedHeader,
                          label: newSubSectionForm.selectedHeader,
                        }
                        : null
                    }
                    classNamePrefix="react-select"
                    placeholder="Select header..."
                    isClearable
                    aria-label="Select Header for Sub-Section"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Section
                  </label>
                  <Select
                    options={
                      newSubSectionForm.selectedHeader
                        ? tableData
                          .find(
                            (header) =>
                              header.name === newSubSectionForm.selectedHeader
                          )
                          ?.sections.map((section) => ({
                            value: section.name,
                            label: section.name,
                          })) || []
                        : []
                    }
                    onChange={(selected) =>
                      handleSubSectionFormChange(
                        "selectedSection",
                        selected ? selected.value : ""
                      )
                    }
                    value={
                      newSubSectionForm.selectedSection
                        ? {
                          value: newSubSectionForm.selectedSection,
                          label: newSubSectionForm.selectedSection,
                        }
                        : null
                    }
                    classNamePrefix="react-select"
                    placeholder="Select section..."
                    isClearable
                    isDisabled={!newSubSectionForm.selectedHeader}
                    aria-label="Select Section for Sub-Section"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-Section Name
                  </label>
                  <input
                    type="text"
                    value={newSubSectionForm.subSectionName}
                    onChange={(e) =>
                      handleSubSectionFormChange(
                        "subSectionName",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm"
                    placeholder="Enter sub-section name"
                    aria-label="Sub-Section Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occurrences
                  </label>
                  <input
                    type="number"
                    value={newSubSectionForm.subSectionOcc}
                    onChange={(e) =>
                      handleSubSectionFormChange(
                        "subSectionOcc",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm"
                    min="1"
                    aria-label="Sub-Section Occurrences"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compensation
                  </label>
                  <input
                    type="number"
                    value={newSubSectionForm.subSectionComp}
                    onChange={(e) =>
                      handleSubSectionFormChange(
                        "subSectionComp",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1F9352] focus:border-[#1F9352] text-sm"
                    min="0"
                    step="1"
                    aria-label="Sub-Section Compensation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <Select
                    options={unitOptions}
                    onChange={(selected) =>
                      handleSubSectionFormChange(
                        "subSectionUnit",
                        selected ? selected.value : "Hr"
                      )
                    }
                    value={unitOptions.find(
                      (option) =>
                        option.value === newSubSectionForm.subSectionUnit
                    )}
                    classNamePrefix="react-select"
                    placeholder="Select unit..."
                    aria-label="Sub-Section Unit"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSubSectionPopup(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={addSubSection}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-[#056E9D] to-[#1F9352] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sub-Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Layout for PNG Export */}
      <div
        ref={printRef}
        className="fixed -top-[10000px] left-0 w-[1400px] bg-white p-8"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <div className="mb-8 pb-6 border-b-2 border-[#1F9352]">
          <div className="flex justify-between items-start">
            <div>
              {officeDetails.logo && (
                <img
                  src={officeDetails.logo}
                  alt="Company Logo"
                  className="h-16 mb-4"
                />
              )}
              <div className="space-y-1 text-sm">
                <div className="font-bold text-lg text-gray-900">
                  {officeDetails.companyName || "Your Company Name"}
                </div>
                <div className="text-gray-700">
                  {officeDetails.phone || "Phone: (555) 123-4567"}
                </div>
                <div className="text-gray-700">
                  {officeDetails.email || "Email: contact@company.com"}
                </div>
                <div className="text-gray-700">
                  {officeDetails.address ||
                    "Address: 123 Business St, City, State"}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1 text-sm">
              <div className="font-bold text-lg text-gray-900">
                Project:{" "}
                {property.projectName !== "Unnamed Project"
                  ? property.projectName
                  : property.address}
              </div>
              <div className="text-gray-700">Address: {property.address}</div>
              <div className="text-gray-700">Date: {property.date}</div>
              <div className="text-gray-700">Area: {property.area}</div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Detailed Cost Breakdown
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold uppercase text-xs">
                <th className="py-3 px-4 text-left w-[100px]">Type</th>
                <th className="py-3 px-4 text-left w-[200px]">Name</th>
                <th className="py-3 px-4 text-left w-[60px]">OCC</th>
                <th className="py-3 px-4 text-left w-[80px]">QTY</th>
                <th className="py-3 px-4 text-left w-[80px]">Unit</th>
                <th className="py-3 px-4 text-left w-[80px]">COMP (%)</th>
                <th className="py-3 px-4 text-left w-[80px]">Add'l COMP (%)</th>
                <th className="py-3 px-4 text-left w-[80px]">E/H</th>
                <th className="py-3 px-4 text-left w-[80px]">TH</th>
                <th className="py-3 px-4 text-left w-[80px]">U/P ($)</th>
                <th className="py-3 px-4 text-left w-[80px]">GM (%)</th>
                <th className="py-3 px-4 text-left w-[80px]">S/P ($)</th>
                <th className="py-3 px-4 text-left w-[100px]">P/Occ ($)</th>
                <th className="py-3 px-4 text-left w-[100px]">T/P ($)</th>
                <th className="py-3 px-4 text-left w-[50px] no-print"></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((header, headerIndex) => (
                <React.Fragment key={header.name}>
                  <tr
                    className={`${headerIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } font-bold border-b border-gray-100`}
                  >
                    <td className="py-4 px-4 text-gray-900">{header.type}</td>
                    <td className="py-4 px-4 text-gray-900">{header.name}</td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4 text-blue-600 font-semibold">
                      {header.gm.toFixed(2)}
                    </td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4 text-[#1F9352] font-bold">
                      $
                      {header.tP.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  {header.sections.map((section, sectionIndex) => (
                    <React.Fragment key={section.name}>
                      <tr
                        className={`${(headerIndex + sectionIndex) % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                          } border-b border-gray-100`}
                      >
                        <td className="py-4 px-4 pl-8 text-gray-900 font-medium">
                          {section.type}
                        </td>
                        <td className="py-4 px-4 pl-8 text-gray-900 font-medium">
                          {section.name}
                        </td>
                        <td className="py-4 px-4">{section.occ}</td>
                        <td className="py-4 px-4"></td>
                        <td className="py-4 px-4"></td>
                        <td className="py-4 px-4">{section.comp.toFixed(2)}</td>
                        <td className="py-4 px-4 text-gray-700 font-medium">
                          {section.eH.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-gray-700 font-medium">
                          {section.th.toFixed(2)}
                        </td>
                        <td className="py-4 px-4"></td>
                        <td className="py-4 px-4 text-blue-600 font-semibold">
                          {section.gm.toFixed(2)}
                        </td>
                        <td className="py-4 px-4"></td>
                        <td className="py-4 px-4 font-semibold text-gray-900">
                          $
                          {section.pOcc.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-4 px-4 text-[#1F9352] font-bold">
                          $
                          {section.tP.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      {section.subSections.map((sub, subIndex) => (
                        <tr
                          key={`${section.name}-${sub.name}`}
                          className="bg-gray-50"
                        >
                          <td className="py-3 px-4 pl-12 text-gray-600 italic text-sm">
                            {sub.type}
                          </td>
                          <td className="py-3 px-4 pl-12 text-gray-600 italic">
                            {sub.name}
                          </td>
                          <td className="py-3 px-4">{sub.occ}</td>
                          <td className="py-3 px-4">{sub.qty}</td>
                          <td className="py-3 px-4">{sub.unit}</td>
                          <td className="py-3 px-4 text-gray-600 font-medium">
                            {section.comp.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-medium">
                            {sub.eH.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-medium">
                            {sub.th.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            ${(sub.uP || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {(sub.gm || 0).toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-medium">
                            ${(sub.sP || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-medium">
                            $
                            {(sub.pOcc || 0).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-3 px-4 text-[#1F9352] font-semibold">
                            $
                            {(sub.tP || 0).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#1F9352] bg-gray-100">
                <td
                  colSpan="12"
                  className="py-4 px-4 text-right font-bold text-gray-900 text-lg"
                >
                  Total Project Cost:
                </td>
                <td className="py-4 px-4 font-bold text-[#1F9352] text-xl">
                  $
                  {summary.totalTP.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Office Details Popup */}
      {showOfficePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5 bg-gradient-to-r from-[#1F9352] to-[#056E9D]">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-xl font-semibold">Enter Office Details</h2>
                <button
                  onClick={() => setShowOfficePopup(false)}
                  aria-label="Close"
                  className="text-white opacity-90 hover:opacity-100 ml-4 rounded-full p-1"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="bg-white p-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={officeDetails.companyName}
                  onChange={(e) =>
                    setOfficeDetails((prev) => ({ ...prev, companyName: e.target.value }))
                  }
                  className="block w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F9352] transition"
                />

                <input
                  type="text"
                  placeholder="Phone"
                  value={officeDetails.phone}
                  onChange={(e) =>
                    setOfficeDetails((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="block w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F9352] transition"
                />

                <input
                  type="text"
                  placeholder="Email"
                  value={officeDetails.email}
                  onChange={(e) =>
                    setOfficeDetails((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="block w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F9352] transition"
                />

                <input
                  type="text"
                  placeholder="Address"
                  value={officeDetails.address}
                  onChange={(e) =>
                    setOfficeDetails((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="block w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F9352] transition"
                />

                <label className="flex items-center gap-3 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="office-logo-upload"
                  />
                  <span className="inline-flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-100">
                    Choose File
                  </span>
                  <span className="text-sm text-gray-500">{officeDetails.logoName || 'No file chosen'}</span>
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowOfficePopup(false)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleOfficePopupSubmit(officeDetails)}
                    className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#1F9352] to-[#056E9D] hover:from-[#187a46] hover:to-[#045f85] shadow-md"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
