# 🧲 Interactive 3D Visualization of a Standard 1D NMR Experiment

An interactive JavaScript visualisation of the bulk magnetisation vector and detected signals during a standard 1D NMR (Nuclear Magnetic Resonance) experiment. 

🔗 **Live demo:** [tkimhofer.github.io/nmr_visualisation](https://tkimhofer.github.io/nmr_visualisation/)

Note: I've added a button top-left to apply RF pulse.

## 🎯 Overview
This project implements and visualises the fundamental physical processes in a standard 90° NMR experiment — from nuclear spin alignment to RF excitation, signal precession, relaxation, and data detection — using an animated 3D scene rendered with [Three.js](https://threejs.org/).

It is meant as an educational tool for students of spectroscopy or physics learning about spin dynamics and NMR signal formation.


## 🧩 Implementation

The magnetisation dynamics are computed from the analytical solutions to the Bloch equations  <sup id="bloch">1</sup> for free precession and relaxation after a 90° pulse in the laboratory frame.

**Key features**
- Animated bulk magnetization vector with 3D axes.
- Real-time exponential `T1` / `T2` relaxation simulation
- Orthogonal detectors and complex signal traces
- Interactive orbit, zoom, and reset button (see upper left)


See [src/code.js](https://github.com/tkimhofer/nmr_visualisation/blob/master/src/code.js) for more implementation details of the signal model and relaxation terms.

---

## 🧠 NMR Spectroscopy in Essence
At its core, an NMR spectrometer comprises a powerful magnet, a probe with radio-frequency coils and transmit/receive electronics for signal excitation and detection.

NMR systems commonly found in research settings have a magnetic field strength of ~14.1 Tesla. Conventionally, this number is quoted by the corresponding 1H (Proton) resonance frequency: 14.1 T ≈ 600 MHz (nominal). 

In comparison, clinical MRI systems have much lower field strengths, usually 1.5–3 T, with up to 7 T being considered as ultra-high-field MRI.
 

### 1. Sample placement
- Temperature & field stabilisation
- Locking, shimming, tuning & matching, RF pulse calibration, etc.

### 2. Nuclear spin alignment
 - NMR-sensitive nuclei align parallel or antiparallel to magnetic field `B0` (vertical/blue axis in [visualisation](https://tkimhofer.github.io/nmr_visualisation/))
 - Parallel/antiparallel orientations correspond to low/high energy states (for 1H, where γ > 0  → antiparallel = low energy, see also reference #2)
 - Slight excess population in the low-energy state → net bulk magnetization (`M`)
 - Population difference proportional to magnetic field strength <sup id="boltz">3</sup>
 - (higher magnetic field strength increases chemical shift dispersion, ie., less peak overlap)

### 3. Bulk magnetization in 3D space
- Bulk magnetization vector `M` (white) is the sum of individual nuclear magnetic moments  
- Longitudinal axis: `z` along `B0` (`Mz` component)
- Transverse axes: `x` (red) and `y` (green), forming the `Mxy` plane

### 4. RF excitation
- Exposed to radiofrequency (RF) pulse -> `B1`
- RF pulse calibrated to rotate `M` by 90° into xy-plane
- `M` starts precessing around z-axis at the Larmor frequency (`omega0` in code)

### 5. Signal evolution and detection

**A. Relaxation effects**
- Magnitude of `Mxy` decays while `Mz` recovers, due to: 
- **T2**: mutual magnetic interactions between spins → loss of phase coherence (spin-spin relax.)
- **T1**: interactions with lattice/environment → recovery along z-axis (spin-lattice relax.)
- Typically, `T2 ≤ T1`.

**B. Signal detection**
- The precessing `Mxy` induces voltage in two orthogonal receiver coils (90° phase difference)
- Detectors / recever channels shown as orange and green cones <sup id="quad">4</sup>
- Resulting time-domain signals are drawn as orange and green traces

**C. Complex signal representation**
- Recorded time-domain signals are a complex-valued: `s(t) = s_Re(t) + i* s_Im(t)`
- The real (`s_Re`) and imaginary (`s_Im`) parts correspond to the two receiver channels
- After Fourier transformation:
  - Real → absorptive line shape
  - Imaginary → dispersive component
 
### 6. Recovery
- Longitudinal magnetization `Mz` grows until equilibrium re-established

### 7. Repetition
- Once equilibrium is reached, the acquisition cycle repeats 
- The number of repetitions (Bruker parameter `NS`: *Number of Scans*) determines signal averaging
- Signal-to-noise ratio (S/N) increases proportionally to the square root of the number of scans

---


## Refs:
<b id="bloch">1</b>: [Bloch equations](https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Supplemental_Modules_(Physical_and_Theoretical_Chemistry)/Spectroscopy/Magnetic_Resonance_Spectroscopies/Nuclear_Magnetic_Resonance/NMR_-_Theory/Bloch_Equations)

<b id="gyro">2</b>: γ = [Gyromagnetic ratio](https://www.kherb.io/docs/nmr_table.html)

<b id="quad">3</b>: [Boltzmann distribution](https://magnetic-resonance.org/ch/02-03.html)

<b id="quad">4</b>: [Quadrature detection](https://en.wikipedia.org/wiki/In-phase_and_quadrature_components)
