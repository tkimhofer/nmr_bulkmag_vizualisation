# Visualisation of a 1D NMR experiment

### Visualisation

https://tkimhofer.github.io/nmr_bulkmag_vizualisation/

### NMR spectroscopy in essence
1. Sample is placed in main magnetic field
   
2. Nuclear spin alignment
  - NMR-sensitive nuclei align parallel or antiparallel to magnetic field `B0` (blue axis)
  - parallel/antiparallel correspond orientations to low/high energy states, respectively.
  - spin populations slightly favour lower energetic state
  - population difference proportional to magnetic field strength <sup id="boltz">1</sup>
  - population difference determines the detectable signal
    
3. Bulk magnetisation in 3d space,
  - bulk magnetisation vector `M` (black vector) represents sum of individual nuclear magnetic moments
  - longitudinal axis, `z`,  along `B0` (`Mz` component)
  - transverse axes forming xy-plane: `x` (green) and `y` (orange)
    
4. RF excitation
  - sample is excited by radiofrequency (RF) pulse
  - RF is calibrated to rotate `M` by 90 degrees into xy-plane
  - `M` starts precessing around `z`-axis at Larmor frequency (`omega0` in code)
    
5. Relaxation and Signal detection 
   A. Relaxation effects
     - magnitude of `Mxy` declines while `Mz` recovers, due to two relaxation effects:
     - `T2`: mutual magnetic interactions between spins - loss of phase coherence (spin-spin relax.)
     - `T1`: interactions with lattice/environment (longitudinal/z axis, spin-lattice relax.)
     - `T2` decay leads to loss of transverse coherence; `T1` governs recovery of longitudinal magnetisation
    
   B. Signal detection
     - Record `Mxy` signal by receiver channels 90 degrees out of phase (orthogonal receiver coils)
     - signal is an induced voltage by precessing magentisation
     - detectors (receiver channels) are indicated by orange/green cones <sup id="quad">2</sup>
     - recorded signals are visualised by orange/green lines starting after detector
    
   C. Complex signal representation
    - Recorded signals represented as complex-valued function in time domain: `s(t) = s_R(t) + i* s_I(t)`
    - the real (`s_R(t)`) and imaginary (`s_I(t)`) parts correspond to the two receiver channels.
    - After Fourier transformation,
        - real part of the spectrum yields the absorptive line shape
        - imaginary part contains the dispersive component
        
6 Recovery
  - `Mz` magnitude grows until equilibrium is re-established
    
7. Repetition 
  - Once equilibrium is reached, data acquisition cycle can start again


## Refs:

<b id="quad">1</b>: [Boltzmann distribution](https://magnetic-resonance.org/ch/02-03.html)

<b id="quad">2</b>: [quadrature detection](https://en.wikipedia.org/wiki/In-phase_and_quadrature_components)
