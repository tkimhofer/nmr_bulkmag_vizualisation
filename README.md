# Visualisation of a 1D NMR experiment

### Visualisation

https://tkimhofer.github.io/nmr_bulkmag_vizualisation/

### NMR spectroscopy in essence
- sample is placed in magnet, NMR-sensitive nuclei align parallel or antiparallel to magnetic field `B0` (corresponding to low & high energy state, resp.)
  - nuclear spin populations slightly favour lower energetic state
  - spin population difference approx. proportional to magnetic field strength <sup id="boltz">1</sup>
  - this difference in populations determines NMR signal strength
- bulk magnetisation vector (`M`) represents sum of individual nuclear magnetic moments (aka macroscopic magnetisation)
- bulk magnetisation vector in 3d space:
  - longitudinal axis `z` (`Mz`, along `B0`)
  - transverse axes `x` and `y` (`Mxy` in xy-plane)
- Excitation by applying radiofrequency (RF) pulse, exactly calibrated so it rotates `M` by 90 degrees into xy plane
- `M` precesses around `z`-axis at Larmor frequency `omega0`
- Relaxation: `Mxy` decays while `Mz` recovers - Why:
  - `T2`: mutual magnetic interactions between spins - loss of phase coherence (spin-spin relax.)
  - `T1`: interactions with lattice/environment (longitudinal/z axis, spin-lattice relax.)
- Record `Mxy` signal by receiver channels 90 degrees out of phase <sup id="quad">2</sup>
  - here visualised by sensors placed in right angle in x and y plane <sup id="quad">2</sup>
- Recorded signals are combined and represented as complex-valued function: `s(t) = s_R(t) + i* s_I(t)` 
    - Real (cosine) component represents dispersive response (x-channel): `s_R(t)`
    - Imaginary (sine) component represents absorptive response (y-channel): `s_I(t)`


## Refs:

<b id="quad">1</b>: [Boltzmann distribution](https://magnetic-resonance.org/ch/02-03.html)

<b id="quad">2</b>: [quadrature detection](https://en.wikipedia.org/wiki/In-phase_and_quadrature_components)
