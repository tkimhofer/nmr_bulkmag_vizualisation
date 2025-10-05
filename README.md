# Visualisation of a 1D NMR experiment

https://tkimhofer.github.io/nmr_bulkmag_vizualisation/

### Visualisation of
- bulk magnetisation vector (M) in 3d space:
  - longitudinal axis z (`Mz`, along `B0`)
  - transversal axes x and y (`Mxy`)
- Excitation by applying RF pulse (exactly calibrated, moving M into transversal plane (`Mxy` max)
- M precesses at `omega0` (Lamour frequency characteristic) 
- Relaxation: `Mxy` decays while `Mz` recovers - Why:
  - `T2`: interactions across spins (spin-spin relax.)
  - `T1`: interactins with environment (longitudinal/z axis, spin-lattice relax.)
- Record `Mxy` signal by sensors placed in right angle in x and y plane<sup>[1](#quad)</sup>
- Recorded signal is represented as complex-valued function: `s(t) = s_R(t) + i_s_I(t)` 
    - Real (`R`) part is in-phase signal `s_R(t)` from the x-axis sensor
    - Imaginary (`I`) part is quadrature signal `i_s_I(t)` from the y-axis sensor


### Coded with three.js.

<a name="quad">1</a>: [quadrature detection](https://en.wikipedia.org/wiki/In-phase_and_quadrature_components)

[^1] [quadrature detection](https://en.wikipedia.org/wiki/In-phase_and_quadrature_components)
