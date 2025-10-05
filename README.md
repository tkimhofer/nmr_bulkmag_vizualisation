# 🧲 Visualization of a 1D NMR Experiment

An interactive **Three.js** visualization of the bulk magnetization vector and detected signals during a simple 1D **NMR (Nuclear Magnetic Resonance)** experiment.

🔗 **Live demo:** [tkimhofer.github.io/nmr_bulkmag_vizualisation](https://tkimhofer.github.io/nmr_bulkmag_vizualisation/)

## 🎯 Overview
This project illustrates the fundamental physical processes in a 1D NMR experiment — from nuclear spin alignment to RF excitation, signal precession, relaxation, and data detection — using an animated 3D scene rendered with [Three.js](https://threejs.org/).

It is meant as an educational tool for students of spectroscopy or physics learning about spin dynamics and NMR signal formation.

---

## 🧠 Concept: NMR Spectroscopy in Essence

### 1. Sample placement
- The sample is placed in the main magnetic field **B₀**.  
- Temperature and field stabilization, shimming, tuning & matching, and RF calibration are performed.

### 2. Nuclear spin alignment
- NMR-sensitive nuclei align **parallel** or **antiparallel** to **B₀** (vertical/blue axis in the [visualization](https://tkimhofer.github.io/nmr_bulkmag_vizualisation/)).
- The parallel/antiparallel orientations correspond to **low** and **high** energy states, respectively.
- Slight excess population in the low-energy state → net **bulk magnetization (M₀)**.
- Population difference ∝ magnetic field strength<sup id="boltz">1</sup> → determines detectable signal strength.

### 3. Bulk magnetization in 3D
- **Bulk magnetization vector** `M` (white) is the sum of individual nuclear magnetic moments.  
- Longitudinal axis: `z` along **B₀** (`Mz` component).  
- Transverse axes: `x` (red) and `y` (green), forming the **Mxy** plane.

### 4. RF excitation
- An RF pulse rotates `M` by 90° into the xy-plane.  
- `M` begins to precess around the z-axis at the **Larmor frequency** `ω₀`.

### 5. Signal evolution and detection

**A. Relaxation effects**
- Magnitude of `Mxy` decays while `Mz` recovers.  
- **T₂**: spin–spin relaxation → loss of phase coherence.  
- **T₁**: spin–lattice relaxation → recovery along z-axis.  
- Typically, `T₂ ≤ T₁`.

**B. Signal detection**
- The precessing `Mxy` induces voltage in two orthogonal receiver coils (90° phase difference).  
- Detectors shown as **orange and green cones**<sup id="quad">2</sup>.  
- Resulting time-domain signals are drawn as **orange and green traces**.

**C. Complex signal representation**
- The detected signal is a complex-valued function:

  \[
  s(t) = s_{Re}(t) + i \, s_{Im}(t)
  \]

- The real (`s_Re`) and imaginary (`s_Im`) parts correspond to the two receiver channels.  
- After Fourier transformation:
  - Real → absorptive line shape.  
  - Imaginary → dispersive component.

### 6. Recovery
- Longitudinal magnetization `Mz` grows until equilibrium is re-established.

### 7. Repetition
- Once equilibrium is reached, the acquisition cycle repeats.  
- The number of repetitions (**Bruker parameter** `NS`: *Number of Scans*) determines signal averaging.  
- Signal-to-noise ratio (S/N) increases as:

  \[
  \text{S/N} \propto \sqrt{NS}
  \]

---

## 🧩 Implementation

| Component | Description |
|------------|-------------|
| **Framework** | [Three.js](https://threejs.org/) for 3D rendering |
| **Language** | JavaScript (ES modules) |
| **Controls** | OrbitControls for camera interaction |
| **Core file** | `src/code.js` — animation and physics of magnetization |
| **HTML/CSS** | `index.html`, `styles/main.css` |
| **Deployment** | Static GitHub Pages |

**Key features**
- Animated bulk magnetization vector with 3D axes.  
- Real-time exponential `T₁` / `T₂` relaxation simulation.  
- Orthogonal detectors and complex signal traces.  
- Interactive orbit, zoom, and reset button.

### NMR spectroscopy in essence
1. Sample is placed in main magnetic field 
     - temperature & field stabilisation
     - locking, shimming, tuning & matching, RF pulse calibration, etc.

2. Nuclear spin alignment
     - NMR-sensitive nuclei align parallel or antiparallel to magnetic field `B0` (vertical/blue axis in [visualisation](https://tkimhofer.github.io/nmr_bulkmag_vizualisation/))
     - parallel/antiparallel correspond orientations to low/high energy states, respectively
     - spin populations slightly favour lower energetic state
     - population difference proportional to magnetic field strength <sup id="boltz">1</sup>
     - population difference determines the detectable signal
    
3. Bulk magnetisation in 3d space,
     - bulk magnetisation vector `M` (white vector) represents sum of individual nuclear magnetic moments
     - longitudinal axis, `z`,  along `B0` (`Mz` component)
     - transverse axes forming xy-plane (`Mxy` component) : `x` (red) and `y` (green), 
    
4. RF excitation
     - sample is excited by radiofrequency (RF) pulse
     - RF is calibrated to rotate `M` by 90 degrees into xy-plane
     - `M` starts precessing around `z`-axis at Larmor frequency (`omega0` in code)
    
5. Signal evolution and detection
   
   A. Relaxation effects
     - magnitude of `Mxy` declines while `Mz` recovers, due to two relaxation effects:
     - `T2`: mutual magnetic interactions between spins → loss of phase coherence (spin-spin relax.)
     - `T1`: interactions with lattice/environment → recovery along z-axis (spin-lattice relax.)
     - `T2` decay leads to loss of transverse coherence; `T1` governs recovery of longitudinal magnetisation
    
   B. Signal detection
     - Record `Mxy` signal by receiver channels 90 degrees out of phase (orthogonal receiver coils)
     - signal is an induced voltage by precessing magentisation
     - detectors (receiver channels) are indicated by orange/green cones <sup id="quad">2</sup>
     - recorded signals are visualised by orange/green lines starting after detector
    
   C. Complex signal representation
    - Recorded signals represented as complex-valued function in time domain: `s(t) = s_Re(t) + i* s_Im(t)`
    - the real (`s_R(t)`) and imaginary (`s_I(t)`) parts correspond to the two receiver channels.
    - After Fourier transformation,
        - real part of the spectrum yields the absorptive line shape
        - imaginary part contains the dispersive component
        
6. Recovery
     - `Mz` magnitude grows until equilibrium is re-established
    
7. Repetition 
     - Once equilibrium is reached, data acquisition cycle can start again
     - the number of repetitions determines the degree of signal averaging (Bruker parameter `NS`: *Number of Scans*) 
     - the spectral signal-to-noise ratio (S/N) increases proportionally to the square root of the number of scans


## Refs:

<b id="quad">1</b>: [Boltzmann distribution](https://magnetic-resonance.org/ch/02-03.html)

<b id="quad">2</b>: [quadrature detection](https://en.wikipedia.org/wiki/In-phase_and_quadrature_components)
