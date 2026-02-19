import { useState, useEffect, useCallback, useRef } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SECTIONS = [
  { id:"chem_phys",   label:"Chem & Physics",          color:"#f97316", icon:"⚗️",
    segments:[
      { id:"gen_chem",  label:"General Chemistry",      color:"#f97316", icon:"🧪" },
      { id:"org_chem",  label:"Organic Chemistry",      color:"#fb923c", icon:"🔗" },
      { id:"physics",   label:"Physics & Math",         color:"#fbbf24", icon:"⚡" },
      { id:"biochem",   label:"Biochemistry",           color:"#f59e0b", icon:"🧬" },
    ]},
  { id:"cars",        label:"CARS",                     color:"#8b5cf6", icon:"📖",
    segments:[
      { id:"cars_comp", label:"Passage Comprehension",  color:"#8b5cf6", icon:"📖" },
      { id:"cars_arg",  label:"Argument & Reasoning",   color:"#a78bfa", icon:"💡" },
    ]},
  { id:"bio_biochem", label:"Biology & Biochemistry",   color:"#22c55e", icon:"🧫",
    segments:[
      { id:"mol_bio",   label:"Molecular Bio & Genetics",color:"#22c55e", icon:"🧬" },
      { id:"cell_bio",  label:"Cell Biology",            color:"#16a34a", icon:"🦠" },
      { id:"organ_sys", label:"Organ Systems",           color:"#4ade80", icon:"🫀" },
    ]},
  { id:"psych_soc",   label:"Psych & Sociology",        color:"#3b82f6", icon:"🧠",
    segments:[
      { id:"behavior",  label:"Behavioral Psychology",  color:"#3b82f6", icon:"🧠" },
      { id:"cognition", label:"Cognition & Perception", color:"#60a5fa", icon:"👁️" },
      { id:"sociology", label:"Sociology & Society",    color:"#818cf8", icon:"👥" },
      { id:"research",  label:"Research & Statistics",  color:"#6366f1", icon:"📊" },
    ]},
];
const ALL_SEGS = SECTIONS.flatMap(s => s.segments);

// ── EXPANDED AAMC-ALIGNED QUESTION BANK (~155 questions) ──────────────────────
const SEED = {
  gen_chem:[
    {id:"gc1", q:"A weak acid has Ka = 1×10⁻⁵. What is its pKa?", opts:["3","4","5","6"], ans:2, exp:"pKa = −log(Ka) = −log(1×10⁻⁵) = 5. [AAMC FC 5A]"},
    {id:"gc2", q:"Which element has the highest electronegativity?", opts:["Carbon","Nitrogen","Oxygen","Fluorine"], ans:3, exp:"Fluorine is the most electronegative element (EN = 4.0 on the Pauling scale). [AAMC FC 5A]"},
    {id:"gc3", q:"At STP, one mole of an ideal gas occupies:", opts:["11.2 L","22.4 L","44.8 L","1 L"], ans:1, exp:"At STP (0 °C, 1 atm), 1 mol ideal gas occupies 22.4 L — the molar volume. [AAMC FC 5E]"},
    {id:"gc4", q:"A buffer has maximum effectiveness when:", opts:["pH is far above pKa","pH is far below pKa","pH equals pKa","pH equals 7"], ans:2, exp:"Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA]). When pH = pKa the ratio is 1:1, giving maximum buffering capacity. [AAMC FC 5B]"},
    {id:"gc5", q:"Which quantum number determines the shape of an orbital?", opts:["Principal (n)","Angular momentum (l)","Magnetic (ml)","Spin (ms)"], ans:1, exp:"Angular momentum quantum number l defines shape: l=0 (s), l=1 (p), l=2 (d), l=3 (f). [AAMC FC 5A]"},
    {id:"gc6", q:"Le Chatelier's principle states that a system at equilibrium will:", opts:["Shift to increase entropy","Counteract any imposed change","Always raise temperature","Increase pressure indefinitely"], ans:1, exp:"When stress is applied (concentration, pressure, temperature change), the system shifts to oppose that change. [AAMC FC 5E]"},
    {id:"gc7", q:"A solution with [OH⁻] = 1×10⁻³ M has a pH of:", opts:["3","8","11","14"], ans:2, exp:"pOH = −log(10⁻³) = 3; pH = 14 − pOH = 11. [AAMC FC 5B]"},
    {id:"gc8", q:"Which thermodynamic condition guarantees spontaneity at ALL temperatures?", opts:["ΔH > 0, ΔS > 0","ΔH < 0, ΔS < 0","ΔH < 0, ΔS > 0","ΔH > 0, ΔS < 0"], ans:2, exp:"ΔG = ΔH − TΔS. If ΔH < 0 and ΔS > 0, ΔG is always negative (spontaneous) regardless of temperature. [AAMC FC 5E]"},
    {id:"gc9", q:"In a galvanic (voltaic) cell, oxidation occurs at the:", opts:["Cathode","Salt bridge","Anode","External circuit"], ans:2, exp:"OIL RIG / AN OX: Anode = Oxidation; Cathode = Reduction. In galvanic cells, the anode is the negative electrode. [AAMC FC 5C]"},
    {id:"gc10", q:"Using Henderson-Hasselbalch, what [A⁻]/[HA] ratio gives pH = 5.76 for acetic acid (pKa = 4.76)?", opts:["0.1","1","10","100"], ans:2, exp:"pH = pKa + log([A⁻]/[HA]) → 5.76 = 4.76 + log(x) → log(x) = 1 → x = 10. [AAMC FC 5B]"},
    {id:"gc11", q:"Which condition prevents calcium phosphate from precipitating in a protein urine test?", opts:["Add buffer for high pH","Add buffer for neutral pH","Add calcium hydroxide","Add sodium phosphate"], ans:1, exp:"Calcium phosphate precipitates at high pH. Maintaining neutral pH keeps it soluble, preventing false positives. [AAMC Sample Question, Skill 3]"},
    {id:"gc12", q:"Adding a common ion to a saturated solution will:", opts:["Increase solubility","Decrease solubility","Not affect solubility","Increase the Ksp"], ans:1, exp:"The common ion effect: adding an ion already in the equilibrium shifts it left (Le Chatelier), decreasing solubility. Ksp itself is unchanged. [AAMC FC 5E]"},
    {id:"gc13", q:"The oxidation state of chromium in K₂Cr₂O₇ is:", opts:["+3","+6","+7","+4"], ans:1, exp:"K is +1 (×2 = +2), O is −2 (×7 = −14). Balance: 2 + 2x − 14 = 0 → x = +6. [AAMC FC 5C]"},
    {id:"gc14", q:"Boiling point elevation is a colligative property, meaning it depends on:", opts:["The identity of the solute","The molecular weight of the solute","The number of solute particles","The color of the solution"], ans:2, exp:"Colligative properties (bp elevation, fp depression, osmotic pressure) depend only on the NUMBER of solute particles, not their identity. ΔTb = iKbm. [AAMC FC 5B]"},
    {id:"gc15", q:"Which process releases the most energy per mole?", opts:["Combustion of CH₄","Dissolution of NaCl","Vaporization of water","Melting of ice"], ans:0, exp:"Combustion reactions are highly exothermic (ΔH ≈ −890 kJ/mol for CH₄). Phase changes and dissolution are much less energetically significant. [AAMC FC 5E]"},
  ],
  org_chem:[
    {id:"oc1", q:"SN2 reactions are favored by:", opts:["Tertiary substrates","Polar protic solvents","Primary substrates in polar aprotic solvents","Bulky nucleophiles"], ans:2, exp:"SN2 requires backside attack: primary substrates minimize steric hindrance; polar aprotic solvents don't solvate the nucleophile. [AAMC FC 5D]"},
    {id:"oc2", q:"Which carbon functional group is most oxidized?", opts:["Alcohol","Aldehyde","Carboxylic acid","Ketone"], ans:2, exp:"Carboxylic acid (–COOH) has carbon at oxidation state +3 — the highest of these options. [AAMC FC 5D]"},
    {id:"oc3", q:"R/S configuration is assigned using:", opts:["Boiling point order","Cahn-Ingold-Prelog priority rules","Direction of optical rotation","Bond angle geometry"], ans:1, exp:"CIP rules rank substituents by atomic number. If priority decreases clockwise with lowest priority pointing away = R; counterclockwise = S. [AAMC FC 5D]"},
    {id:"oc4", q:"What functional group forms when two amino acids join at a peptide bond?", opts:["Amine","Aldehyde","Amide","Carboxyl"], ans:2, exp:"Peptide bond: carboxyl of one AA + amine of another → amide (–CO–NH–) + water lost. This is an AAMC Sample Question (Skill 1). [AAMC FC 5D]"},
    {id:"oc5", q:"SN1 reactions are favored by:", opts:["Primary substrates","Polar aprotic solvents","Strong nucleophiles","Tertiary substrates in polar protic solvents"], ans:3, exp:"SN1 forms a carbocation intermediate. Tertiary carbocations are most stable (3 alkyl groups donate e⁻). Polar protic solvents stabilize the ionic transition state and carbocation. [AAMC FC 5D]"},
    {id:"oc6", q:"E2 elimination requires which geometry between the leaving group and β-hydrogen?", opts:["Syn-periplanar (0°)","Gauche (60°)","Anti-periplanar (180°)","No specific geometry"], ans:2, exp:"E2 is a concerted one-step mechanism requiring anti-periplanar (180°) alignment for proper orbital overlap between the C–H and C–LG bonds. [AAMC FC 5D]"},
    {id:"oc7", q:"Which reagent selectively reduces aldehydes and ketones but NOT esters?", opts:["LiAlH₄","NaBH₄","H₂/Pd","Ozone (O₃)"], ans:1, exp:"NaBH₄ is a mild, selective hydride donor that reduces only aldehydes and ketones. LiAlH₄ is more powerful and reduces all carbonyls including esters and acids. [AAMC FC 5D]"},
    {id:"oc8", q:"In ¹H NMR, a carboxylic acid –OH proton appears at approximately:", opts:["0–2 ppm","3–5 ppm","6–8 ppm","10–12 ppm"], ans:3, exp:"Carboxylic acid OH protons are highly deshielded by the adjacent C=O, appearing at ~10–12 ppm — the most downfield common proton signal. [AAMC FC 5D]"},
    {id:"oc9", q:"Enantiomers are identical in all physical properties EXCEPT:", opts:["Melting point","Boiling point","Optical rotation direction","Solubility in water"], ans:2, exp:"Enantiomers rotate plane-polarized light equally but in opposite directions (+/−). All other physical properties are identical in achiral environments. [AAMC FC 5D]"},
    {id:"oc10", q:"OsO₄ reacts with an alkene to form:", opts:["An epoxide","A trans-diol","A syn-vicinal diol","An aldehyde"], ans:2, exp:"OsO₄ adds two OH groups to the same face of the double bond (syn addition) → syn-diol (vicinal diol). [AAMC FC 5D]"},
    {id:"oc11", q:"Which statement about aldehydes vs. ketones is correct?", opts:["Ketones are more reactive toward nucleophilic addition","Aldehydes have a carbonyl on a terminal carbon and are more reactive","Ketones and aldehydes have equal reactivity","Aldehydes cannot be oxidized further"], ans:1, exp:"Aldehydes (–CHO) are terminal and more electrophilic/reactive than ketones. Aldehydes can be further oxidized to carboxylic acids; ketones cannot. [AAMC FC 5D]"},
    {id:"oc12", q:"IR spectroscopy is most useful for:", opts:["Determining molecular weight","Identifying functional groups via bond vibrations","Determining the number of carbons","Measuring optical rotation"], ans:1, exp:"IR spectroscopy detects characteristic bond stretching/bending vibrations (fingerprints for functional groups). Key peaks: C=O ~1700 cm⁻¹, O–H ~3300 cm⁻¹. [AAMC FC 5D]"},
  ],
  physics:[
    {id:"ph1", q:"If resistance doubles and voltage stays constant, current:", opts:["Doubles","Halves","Stays the same","Quadruples"], ans:1, exp:"Ohm's Law: V = IR. If R doubles and V is constant, I = V/R is halved. [AAMC FC 5C]"},
    {id:"ph2", q:"A projectile launched horizontally has zero initial:", opts:["Speed","Horizontal velocity","Vertical velocity","Gravitational acceleration"], ans:2, exp:"Horizontal launch → vertical initial velocity = 0. Gravity immediately provides downward acceleration (g = 9.8 m/s²). Horizontal and vertical motions are independent. [AAMC FC 4A]"},
    {id:"ph3", q:"Which lens corrects myopia (nearsightedness)?", opts:["Convex (converging)","Concave (diverging)","Plano-convex","Bifocal only"], ans:1, exp:"Myopia: parallel rays focus in front of the retina. Concave (diverging) lenses spread light, shifting the focal point back onto the retina. [AAMC FC 4D]"},
    {id:"ph4", q:"The unit of electric potential difference is:", opts:["Ampere","Ohm","Watt","Volt"], ans:3, exp:"Voltage = electric potential difference, measured in Volts (V = J/C — joules per coulomb). [AAMC FC 5C]"},
    {id:"ph5", q:"Sound travels fastest through which medium?", opts:["Vacuum","Air","Water","Steel"], ans:3, exp:"Sound requires a medium and travels faster through denser/stiffer materials: steel (~5000 m/s) > water (~1500 m/s) > air (~343 m/s). Cannot travel through vacuum. [AAMC FC 4C]"},
    {id:"ph6", q:"Work equals:", opts:["Force × time","Force × displacement in direction of force","Mass × acceleration","Power × velocity"], ans:1, exp:"W = Fd·cosθ. Work is done only when force has a component in the direction of displacement. [AAMC FC 4A]"},
    {id:"ph7", q:"The First Law of Thermodynamics states:", opts:["Entropy always increases","Energy cannot be created or destroyed","Heat flows from cold to hot","Systems seek minimum enthalpy"], ans:1, exp:"First Law: ΔU = q + w. The total energy of an isolated system is conserved; energy is only transferred or converted. [AAMC FC 5E]"},
    {id:"ph8", q:"According to Bernoulli's principle, as fluid flows into a narrower tube:", opts:["Pressure increases, velocity decreases","Pressure decreases, velocity increases","Both pressure and velocity increase","Both pressure and velocity decrease"], ans:1, exp:"Bernoulli: P + ½ρv² + ρgh = constant. Smaller area → higher velocity (continuity) → lower pressure. This explains airfoil lift and venturi effects. [AAMC FC 4B]"},
    {id:"ph9", q:"The continuity equation (A₁v₁ = A₂v₂) for incompressible fluids means:", opts:["Flow rate decreases in a narrower tube","Velocity increases in a narrower tube","Pressure increases in a narrower tube","Velocity decreases in a wider tube only"], ans:1, exp:"Continuity: Q = Av is constant. Smaller cross-section → higher velocity. This is why blood moves faster in large vessels than across all capillaries combined (collectively they have huge total area). [AAMC FC 4B]"},
    {id:"ph10", q:"An ambulance approaches you sounding its siren. The pitch you hear is:", opts:["Lower than the emitted frequency","The same as emitted","Higher than the emitted frequency","Variable, depending on weather"], ans:2, exp:"Doppler effect: approaching source compresses wavefronts → shorter wavelength → higher frequency/pitch. As it moves away, pitch drops. [AAMC FC 4C]"},
    {id:"ph11", q:"The photoelectric effect shows that electrons are ejected only when light:", opts:["Has sufficient intensity regardless of frequency","Exceeds a minimum threshold frequency","Is reflected off the metal surface","Has wavelengths in the visible spectrum only"], ans:1, exp:"Einstein: photoelectric effect proves light consists of photons (quanta). Electron ejection depends on photon energy (E = hf), not intensity. Below threshold frequency, no ejection occurs regardless of brightness. [AAMC FC 5A]"},
    {id:"ph12", q:"After 3 half-lives, what fraction of a radioactive sample remains?", opts:["1/4","1/6","1/8","1/16"], ans:2, exp:"Each half-life: half remains. (1/2)¹ = ½, (1/2)² = ¼, (1/2)³ = ⅛. After 3 half-lives, 12.5% remains. [AAMC FC 5A]"},
    {id:"ph13", q:"Poiseuille's Law states that blood flow rate through a vessel is most sensitive to:", opts:["Length of the vessel","Viscosity of blood","Pressure gradient","Radius of the vessel (to the 4th power)"], ans:3, exp:"Q = πr⁴ΔP / (8ηL). Flow is proportional to r⁴ — doubling the radius increases flow 16-fold. This is why arterial constriction/dilation has profound effects on blood flow. [AAMC FC 4B]"},
  ],
  biochem:[
    {id:"bc1", q:"Which bonds hold together the two strands of DNA?", opts:["Peptide bonds","Ionic bonds","Hydrogen bonds","Covalent phosphodiester bonds"], ans:2, exp:"Hydrogen bonds between complementary base pairs (A–T: 2 H-bonds; G–C: 3 H-bonds) hold the two strands together. G–C pairs are stronger. [AAMC FC 1A]"},
    {id:"bc2", q:"Km represents the substrate concentration at:", opts:["Maximum velocity","Half of maximum velocity (½Vmax)","Zero velocity","Enzyme saturation"], ans:1, exp:"Km = [S] when v = ½Vmax. Lower Km = higher affinity. Km is an intrinsic property of the enzyme-substrate pair. [AAMC FC 1A]"},
    {id:"bc3", q:"Which process generates the most ATP per glucose molecule?", opts:["Glycolysis only","Lactic acid fermentation","Oxidative phosphorylation (ETC)","TCA cycle alone"], ans:2, exp:"Oxidative phosphorylation via the ETC generates ~28–32 ATP, compared to glycolysis (2 net ATP). The ETC uses NADH and FADH₂ to drive ATP synthase. [AAMC FC 3B]"},
    {id:"bc4", q:"Primary protein structure is defined as:", opts:["Alpha helices and beta sheets","3D folded conformation","The linear amino acid sequence","Quaternary subunit assembly"], ans:2, exp:"Primary structure = the sequence of amino acids linked by peptide bonds. It determines all higher-order structures. [AAMC FC 1A]"},
    {id:"bc5", q:"Which molecule is the cell's universal energy currency?", opts:["NADH","FADH₂","GTP","ATP"], ans:3, exp:"ATP (adenosine triphosphate) powers virtually all cellular processes. Its hydrolysis (ATP → ADP + Pᵢ) releases ~7.3 kcal/mol. [AAMC FC 3A]"},
    {id:"bc6", q:"Fatty acid beta-oxidation occurs in the:", opts:["Cytoplasm","Smooth ER","Mitochondrial matrix","Nucleus"], ans:2, exp:"Beta-oxidation in the mitochondrial matrix sequentially cleaves 2-carbon units (acetyl-CoA) from fatty acids, generating NADH and FADH₂ per cycle. [AAMC FC 3B]"},
    {id:"bc7", q:"Competitive inhibition affects enzyme kinetics by:", opts:["Decreasing both Km and Vmax","Increasing apparent Km; Vmax unchanged","Decreasing Vmax; Km unchanged","Increasing both Km and Vmax"], ans:1, exp:"Competitive inhibitor binds the active site, competing with substrate → apparent Km increases (lower affinity). Excess substrate can outcompete the inhibitor, so Vmax is unchanged. [AAMC FC 1A]"},
    {id:"bc8", q:"Net ATP yield from glycolysis (cytoplasm, per glucose) is:", opts:["1 ATP","2 ATP","4 ATP","38 ATP"], ans:1, exp:"Glycolysis: 4 ATP produced − 2 ATP invested = net 2 ATP + 2 NADH + 2 pyruvate per glucose. [AAMC FC 3B]"},
    {id:"bc9", q:"Each acetyl-CoA entering the TCA cycle generates:", opts:["1 NADH, 1 FADH₂, 1 ATP","2 NADH, 1 FADH₂, 1 GTP","3 NADH, 1 FADH₂, 1 GTP","3 NADH, 2 FADH₂, 2 GTP"], ans:2, exp:"Per turn of the TCA cycle: 3 NADH + 1 FADH₂ + 1 GTP (= ATP equivalent) + 2 CO₂ released. [AAMC FC 3B]"},
    {id:"bc10", q:"At physiological pH 7.4, the alpha-amino group of a free amino acid exists as:", opts:["–NH₂ (uncharged)","–NH₃⁺ (protonated, positively charged)","–NH⁻ (deprotonated)","–N=O (oxidized)"], ans:1, exp:"Amino group pKa ≈ 9. At pH 7.4 (below pKa), the amino group is protonated: –NH₃⁺. Carboxyl group (pKa ≈ 2) is deprotonated: –COO⁻. [AAMC FC 5D]"},
    {id:"bc11", q:"Low pH shifts the oxygen-hemoglobin dissociation curve to the right (Bohr effect), meaning:", opts:["Hemoglobin binds O₂ more tightly","Hemoglobin releases O₂ more readily to tissues","CO₂ increases O₂ affinity","The curve shifts left in exercising muscle"], ans:1, exp:"Bohr effect: high CO₂/H⁺ (low pH) stabilizes the T-state (low-affinity) hemoglobin → O₂ released to active tissues. Curve shifts right = lower O₂ affinity. [AAMC Sample Question, Skill 4; FC 3B]"},
    {id:"bc12", q:"NAD⁺ functions in cellular catabolism as:", opts:["An electron donor to substrates","An electron acceptor, becoming NADH","A structural component of ATP","A direct source of energy"], ans:1, exp:"NAD⁺ (oxidized form) accepts 2 electrons + 1 H⁺ → NADH (reduced). NADH then donates electrons to Complex I of the ETC, driving ATP synthesis. [AAMC FC 3B]"},
    {id:"bc13", q:"Which type of enzyme inhibition changes Vmax but NOT Km?", opts:["Competitive inhibition","Uncompetitive inhibition","Noncompetitive inhibition","Substrate inhibition"], ans:2, exp:"Noncompetitive inhibitors bind an allosteric site (not the active site) regardless of substrate. They reduce Vmax (fewer functional enzyme molecules) but do not affect Km (substrate binding is unaffected). [AAMC FC 1A]"},
  ],
  cars_comp:[
    {id:"cc1", q:"In CARS, identifying the author's main argument primarily helps you:", opts:["Summarize every detail","Anchor all other questions to a central thesis","Identify rhetorical devices","Find factual errors"], ans:1, exp:"The central claim is the interpretive anchor. Every tone, inference, and application question should be evaluated against it. [AAMC CARS Skill 1]"},
    {id:"cc2", q:"When a CARS passage uses 'plausible' rather than 'certain,' this signals:", opts:["Full author endorsement","The claim is likely false","Hedged, qualified support — not absolute commitment","The point is irrelevant to the argument"], ans:2, exp:"Hedge words (plausible, may, suggests, arguably, could) indicate the author is presenting a qualified position — a critical tonal cue on CARS. [AAMC CARS Skill 1]"},
    {id:"cc3", q:"'Which answer is MOST supported by the passage?' requires you to:", opts:["Apply outside knowledge","Select the most universally true statement","Select the choice best grounded in passage evidence","Choose the most specific answer"], ans:2, exp:"CARS is 100% passage-based. The correct answer must be directly supported or implied by the passage text — never by outside knowledge. [AAMC CARS Skill 1]"},
    {id:"cc4", q:"The author's tone is best identified through:", opts:["The subject matter of the passage","Word choice, qualifiers, and how opposing views are framed","The number of examples given","Whether the author uses first person"], ans:1, exp:"Tone = language choices. Look for evaluative adjectives, rhetorical questions, sarcasm, hedges, and how the author characterizes opposing ideas. [AAMC CARS Skill 2]"},
    {id:"cc5", q:"'Application' questions in CARS ask you to:", opts:["Summarize the passage","Apply the author's logic or principles to a new situation","Critique the author's research methodology","Identify the author's implicit assumptions only"], ans:1, exp:"Application questions extend the author's logic to scenarios not discussed in the passage. The author's reasoning (not your own opinion) guides the answer. [AAMC CARS Skill 2]"},
    {id:"cc6", q:"When asked for the author's 'primary purpose,' the best answer:", opts:["Describes a specific detail from one paragraph","Reflects the overarching goal of the entire passage","Cites an outside source","Identifies a fact in the opening sentence only"], ans:1, exp:"Primary purpose = the big-picture goal across the whole passage. Not a detail, not outside info — what was the author trying to accomplish overall? [AAMC CARS Skill 1]"},
    {id:"cc7", q:"A CARS answer that goes 'beyond the scope' of the passage is wrong because:", opts:["It is too brief","It introduces claims not supported or implied by the passage","It contradicts the first paragraph","It uses language from the passage"], ans:1, exp:"CARS demands passage grounding. Choices that import plausible-sounding but unsupported external ideas are always wrong, even if factually true in the real world. [AAMC CARS Skill 1]"},
    {id:"cc8", q:"When two answer choices seem equally correct, the tie-breaker is:", opts:["Choose the longer one","Choose the one matching outside knowledge","Which is more directly supported by specific passage text","Choose the first one listed"], ans:2, exp:"Ask: 'Can I point to the passage text that supports this?' The answer better grounded in specific evidence is correct. CARS never rewards outside knowledge. [AAMC CARS Skill 1]"},
    {id:"cc9", q:"The difference between 'inference' and 'stated fact' in CARS is:", opts:["Inferences are always wrong","Stated facts appear verbatim; inferences are logical conclusions not explicitly stated","Inferences require outside knowledge","They are the same thing"], ans:1, exp:"Stated facts are directly written. Inferences are conclusions the author implies but does not explicitly state — still grounded in the passage. [AAMC CARS Skill 2]"},
    {id:"cc10", q:"In CARS, the passage's structure (e.g., 'compare/contrast,' 'problem/solution') helps because:", opts:["It tells you the author's educational background","It reveals how the author organizes and supports the main argument","It determines the correct answer automatically","It is irrelevant to question-answering"], ans:1, exp:"Recognizing passage structure (argument, narrative, analysis, compare/contrast) helps you predict where key information is and how the author builds the central claim. [AAMC CARS Skill 1]"},
  ],
  cars_arg:[
    {id:"ca1", q:"An ad hominem fallacy attacks:", opts:["The logic of an argument","The person making the argument","The evidence presented","The stated conclusion"], ans:1, exp:"Ad hominem attacks the person rather than the argument's logic or evidence — a core CARS logical fallacy. [AAMC CARS Skill 2]"},
    {id:"ca2", q:"Which most effectively strengthens a causal claim?", opts:["Showing correlation between two variables","Ruling out alternative explanations","Increasing sample size alone","Adding vivid anecdotal evidence"], ans:1, exp:"Causation requires eliminating confounds. Ruling out alternative causes is the strongest support for a causal claim — correlation alone never establishes causation. [AAMC CARS Skill 2]"},
    {id:"ca3", q:"A 'straw man' fallacy involves:", opts:["Misrepresenting an argument to attack a weaker version","Appealing to a recognized authority","Drawing an analogy","Using circular reasoning"], ans:0, exp:"Straw man: distort the opponent's actual argument into an easier-to-attack version, then defeat that instead. This avoids engaging the real claim. [AAMC CARS Skill 2]"},
    {id:"ca4", q:"A deductively valid argument is one where:", opts:["All premises are true","The conclusion follows necessarily if the premises are true","It uses quantitative evidence","It avoids emotional appeals"], ans:1, exp:"Validity is about structure, not truth: if the premises WERE true, the conclusion MUST follow. An argument can be valid but have false premises (unsound). [AAMC CARS Skill 2]"},
    {id:"ca5", q:"Which is an example of circular reasoning?", opts:["'Clinical trials demonstrate this drug is effective'","'The Bible is true because the Bible says so'","'Most experts agree, so it is likely correct'","'If A causes B and B causes C, then A causes C'"], ans:1, exp:"Circular reasoning (begging the question): the conclusion is smuggled into the premise — 'the Bible is true because the Bible says so' assumes what it intends to prove. [AAMC CARS Skill 2]"},
    {id:"ca6", q:"Which correlation is most consistent with the bystander effect?", opts:["More bystanders → less time before someone helps","More bystanders → more time before someone helps","Fewer bystanders → more time before someone helps","Number of bystanders is unrelated to helping behavior"], ans:1, exp:"Bystander effect (Darley & Latané): more bystanders → greater diffusion of responsibility → longer response time. Positive correlation between # bystanders and response delay. [AAMC Sample Question, Skill 4; FC 7B]"},
    {id:"ca7", q:"What does Bourdieu's 'cultural capital' concept predict?", opts:["Youth culture will be most valued","Cultural practices converge with better communication","Class-based cultural distinctions diminish during recessions","Cultural distinctions of elite classes will be more socially valued"], ans:3, exp:"Cultural capital: knowledge, behaviors, and tastes of dominant/elite classes are institutionally valued and reproduced — perpetuating social stratification. [AAMC Sample Question, Skill 2; FC 10A]"},
    {id:"ca8", q:"A 'false dichotomy' presents:", opts:["Only two options when more exist","An irrelevant conclusion","An appeal to authority","Statistics without context"], ans:0, exp:"False dichotomy/dilemma: oversimplifies a complex issue into exactly two options (e.g., 'you're either with us or against us'), ignoring other possibilities. [AAMC CARS Skill 2]"},
    {id:"ca9", q:"Which best describes the fallacy of 'appeal to authority'?", opts:["Attacking the speaker personally","Using an expert's opinion as definitive proof even when outside their expertise","Misrepresenting an argument","Assuming two things that correlate are causally related"], ans:1, exp:"Appeal to authority: citing an authority figure as conclusive evidence, especially when their expertise doesn't apply to the specific claim. Expertise within a field is relevant; outside it is fallacious. [AAMC CARS Skill 2]"},
    {id:"ca10", q:"In CARS, to weaken an argument you must find evidence that:", opts:["Supports the author's main conclusion","Makes the conclusion less likely to be true given the premises","Is unrelated to the passage topic","Confirms the author's assumptions"], ans:1, exp:"Weakening an argument: find evidence that undermines the premise, breaks the logical connection, or provides an alternative explanation that makes the conclusion less probable. [AAMC CARS Skill 2]"},
  ],
  mol_bio:[
    {id:"mb1", q:"Which enzyme synthesizes the new DNA strand during replication?", opts:["Helicase","Primase","DNA Polymerase III","Ligase"], ans:2, exp:"DNA Pol III (prokaryotes) is the main replicative polymerase, extending the new strand 5'→3'. It cannot start new chains — primase first makes an RNA primer. [AAMC FC 1B]"},
    {id:"mb2", q:"The central dogma of molecular biology is:", opts:["DNA → RNA → Protein","Protein → RNA → DNA","RNA → DNA → Protein","DNA → Protein directly"], ans:0, exp:"DNA is transcribed → mRNA, which is translated → protein. Reverse transcriptase (in retroviruses) can go RNA → DNA — an exception to the classic dogma. [AAMC FC 1B]"},
    {id:"mb3", q:"Which mutation type is most likely to be silent?", opts:["Frameshift","Nonsense","Missense","Synonymous (degenerate)"], ans:3, exp:"The genetic code is degenerate — multiple codons encode the same amino acid. Synonymous (silent) mutations change the codon but not the amino acid or protein function. [AAMC FC 1B]"},
    {id:"mb4", q:"In a testcross, the unknown organism is crossed with:", opts:["A heterozygote (Aa)","A homozygous dominant (AA)","A homozygous recessive (aa)","Another unknown"], ans:2, exp:"Testcross with homozygous recessive (aa): if offspring are all dominant phenotype → unknown is AA; if 50% dominant + 50% recessive → unknown is Aa. [AAMC FC 2A]"},
    {id:"mb5", q:"Which RNA molecule carries amino acids to the ribosome?", opts:["mRNA","rRNA","tRNA","snRNA"], ans:2, exp:"tRNA has an anticodon complementary to mRNA codons and is aminoacylated (charged) with the corresponding amino acid by aminoacyl-tRNA synthetases. [AAMC FC 1B]"},
    {id:"mb6", q:"Hardy-Weinberg equilibrium requires all of the following EXCEPT:", opts:["Random mating","No mutation","Large population size","Natural selection"], ans:3, exp:"H-W equilibrium: p² + 2pq + q² = 1. Requires: random mating, no mutation, large population, no migration, and NO natural selection (no selective pressure). [AAMC FC 2A]"},
    {id:"mb7", q:"Starting from AUG, how many amino acids does 5'-CUGCCAAUGUGCUAAUCGCG-3' encode?", opts:["2","3","6","8"], ans:0, exp:"Scan for AUG: ...A-A-U-G-U-G-C-U-A-A → AUG (Met=AA1), UGC (Cys=AA2), UAA = stop. Polypeptide = 2 amino acids. [AAMC Sample Question, Skill 2; FC 1B]"},
    {id:"mb8", q:"In the lac operon, transcription is induced when:", opts:["Lactose is absent and repressor binds operator","Lactose is present, allolactose inactivates the repressor","Glucose is high regardless of lactose","The repressor is constitutively active"], ans:1, exp:"Allolactose (lactose metabolite) binds the lacI repressor, causing conformational change → repressor cannot bind operator → RNA polymerase transcribes structural genes. [AAMC FC 1B]"},
    {id:"mb9", q:"PCR (polymerase chain reaction) requires all EXCEPT:", opts:["Template DNA and primers","Taq polymerase and dNTPs","Thermal cycler","Ribosomes"], ans:3, exp:"PCR components: template DNA, primers (forward + reverse), Taq polymerase (heat-stable), dNTPs, and a thermal cycler. Ribosomes are used in translation, not PCR. [AAMC FC 1B]"},
    {id:"mb10", q:"SDS-PAGE separates proteins by:", opts:["Charge alone","Isoelectric point","Molecular weight","Hydrophobicity"], ans:2, exp:"SDS denatures proteins and coats them uniformly negative. In the electric field, they migrate solely by molecular weight (smaller = faster). [AAMC Sample Question, Skill 3; FC 1A]"},
    {id:"mb11", q:"DNA replication is 'semiconservative' because:", opts:["Only one strand is copied","Each daughter DNA has one original and one newly synthesized strand","Both strands are entirely new","Replication only starts from one origin"], ans:1, exp:"Meselson & Stahl (1958): ¹⁵N/¹⁴N experiment proved semiconservative replication. Each daughter double helix has one parental and one new strand. [AAMC FC 1B]"},
    {id:"mb12", q:"The lytic cycle differs from the lysogenic cycle in that it:", opts:["Integrates viral DNA into the host genome","Immediately replicates and lyses the host cell","Causes no harm to the host","Only occurs in eukaryotes"], ans:1, exp:"Lytic cycle: virus enters → hijacks host machinery → produces progeny virions → lyses (destroys) host cell. Lysogenic cycle = integration (prophage) and dormancy until induction. [AAMC FC 2B]"},
    {id:"mb13", q:"Which process is responsible for generating genetic diversity during meiosis?", opts:["DNA methylation","Crossing over (recombination) in prophase I","Semiconservative replication","Protein synthesis"], ans:1, exp:"Crossing over in prophase I of meiosis exchanges segments between homologous chromosomes, generating new allele combinations. Independent assortment (meiosis I) also contributes. [AAMC FC 2A]"},
  ],
  cell_bio:[
    {id:"cb1", q:"The Na⁺/K⁺-ATPase pump moves:", opts:["3 Na⁺ in, 2 K⁺ out","2 Na⁺ out, 3 K⁺ in","3 Na⁺ out, 2 K⁺ in","2 Na⁺ in, 2 K⁺ out"], ans:2, exp:"3 Na⁺ pumped OUT, 2 K⁺ pumped IN per ATP hydrolyzed. Creates the electrochemical gradient (resting potential ≈ −70 mV) essential for nerve and muscle function. [AAMC FC 3A]"},
    {id:"cb2", q:"Mitosis produces:", opts:["4 haploid cells","2 genetically identical diploid cells","2 haploid cells","4 diploid cells"], ans:1, exp:"Mitosis: 1 diploid (2n) cell → 2 diploid daughter cells with identical genetic content. Used for growth, repair, and asexual reproduction. [AAMC FC 1C]"},
    {id:"cb3", q:"The Golgi apparatus primarily:", opts:["Synthesizes ATP","Synthesizes proteins","Modifies, packages, and sorts proteins for their destinations","Replicates DNA"], ans:2, exp:"Golgi (cis→trans): receives proteins from ER, modifies them (glycosylation, etc.), and routes them to secretion, lysosomes, or plasma membrane. [AAMC FC 2A]"},
    {id:"cb4", q:"Which organelle is the site of aerobic respiration (TCA cycle + ETC)?", opts:["Nucleus","Ribosome","Mitochondria","Smooth ER"], ans:2, exp:"Mitochondria: TCA cycle occurs in the matrix; ETC + ATP synthase are on the inner mitochondrial membrane. [AAMC FC 3B]"},
    {id:"cb5", q:"In order, the phases of the cell cycle are:", opts:["G1→S→M→G2","G1→S→G2→M","S→G1→G2→M","M→G1→G2→S"], ans:1, exp:"Interphase: G1 (growth) → S (DNA synthesis/replication) → G2 (prep for division). Then M phase (mitosis + cytokinesis). [AAMC FC 1C]"},
    {id:"cb6", q:"Gs protein-coupled receptor (GPCR) activation leads to:", opts:["Direct gene transcription","Adenylyl cyclase → ↑cAMP → protein kinase A (PKA) activation","Immediate apoptosis","Inhibition of phospholipase C"], ans:1, exp:"Gs-GPCR: ligand binds receptor → Gs activates adenylyl cyclase → cAMP increases → PKA phosphorylates downstream targets. Classic second-messenger cascade. [AAMC FC 2A]"},
    {id:"cb7", q:"Which transport requires a protein carrier but NO ATP?", opts:["Primary active transport","Secondary active transport","Facilitated diffusion","Endocytosis"], ans:2, exp:"Facilitated diffusion: uses channel or carrier proteins, moves down concentration gradient, no energy required. Examples: GLUT transporters (glucose), aquaporins (water). [AAMC FC 3A]"},
    {id:"cb8", q:"Apoptosis differs from necrosis in that apoptosis:", opts:["Is always pathological","Causes cellular swelling and membrane rupture","Is programmed, orderly, and does not cause inflammation","Releases cellular contents causing tissue damage"], ans:2, exp:"Apoptosis: programmed cell death — cell shrinks, DNA fragments (laddering), apoptotic bodies form, phagocytes clear debris without inflammation. Necrosis = uncontrolled, inflammatory. [AAMC FC 1C]"},
    {id:"cb9", q:"Secondary active transport (e.g., Na⁺-glucose cotransporter):", opts:["Directly uses ATP to transport glucose","Uses the Na⁺ electrochemical gradient established by the Na⁺/K⁺-ATPase","Moves glucose against both its own and Na⁺ gradients using ATP","Requires no gradient or energy"], ans:1, exp:"Secondary active transport: couples downhill movement of Na⁺ (established by the primary Na⁺/K⁺-ATPase) to drive uphill transport of glucose. ATP is used indirectly. [AAMC FC 3A]"},
    {id:"cb10", q:"Microtubules form the mitotic spindle and are composed of:", opts:["Actin","Myosin","Tubulin (α and β subunits)","Keratin"], ans:2, exp:"Microtubules = polymerized α/β-tubulin dimers. They form the mitotic spindle, cilia, flagella, and serve as tracks for kinesin and dynein motor proteins. [AAMC FC 2A]"},
    {id:"cb11", q:"Which cell junction allows direct communication between adjacent cells?", opts:["Tight junction","Desmosome","Gap junction","Adherens junction"], ans:2, exp:"Gap junctions: connexin protein channels connect the cytoplasm of adjacent cells directly, allowing ions and small molecules to pass. Important for cardiac and smooth muscle coordination. [AAMC FC 2A]"},
  ],
  organ_sys:[
    {id:"os1", q:"The Frank-Starling law states that stroke volume:", opts:["Increases with increased heart rate","Increases with greater ventricular preload (end-diastolic volume)","Decreases when afterload decreases","Is independent of ventricular filling"], ans:1, exp:"Frank-Starling: increased ventricular filling stretches myocytes → more forceful contraction (optimal actin-myosin overlap) → greater stroke volume. [AAMC FC 4B]"},
    {id:"os2", q:"The proximal convoluted tubule (PCT) is the primary site for:", opts:["Aldosterone-regulated Na⁺ reabsorption","Concentration of urine by countercurrent multiplication","~65–70% of Na⁺ and water reabsorption (isosmotic)","Proton secretion only"], ans:2, exp:"PCT reabsorbs ~65–70% of filtered Na⁺, water, glucose, amino acids, and bicarbonate isosmotically. The collecting duct is where aldosterone and ADH act for fine-tuning. [AAMC FC 4C]"},
    {id:"os3", q:"ACTH stimulates the adrenal cortex to produce:", opts:["Aldosterone","Adrenaline (epinephrine)","Cortisol","Antidiuretic hormone (ADH)"], ans:2, exp:"HPA axis: CRH (hypothalamus) → ACTH (anterior pituitary) → cortisol (adrenal cortex zona fasciculata). Cortisol is the primary glucocorticoid. [AAMC FC 3C]"},
    {id:"os4", q:"During rapid depolarization of an action potential, which ion rushes in?", opts:["K⁺ efflux","Na⁺ influx","Ca²⁺ influx","Cl⁻ efflux"], ans:1, exp:"Voltage-gated Na⁺ channels open → rapid Na⁺ influx → membrane depolarizes from −70 mV to approximately +30 mV. K⁺ efflux then causes repolarization. [AAMC FC 3A]"},
    {id:"os5", q:"The Bohr effect describes:", opts:["CO₂ binding to hemoglobin","Decreased pH reducing hemoglobin's O₂ affinity, shifting the dissociation curve right","Increased temperature increasing O₂ affinity","The cooperative binding of O₂ to hemoglobin"], ans:1, exp:"Bohr effect: increased CO₂/H⁺ (decreased pH) in active tissues stabilizes the T-state (low-affinity) hemoglobin → O₂ released to tissues. Curve shifts right. [AAMC Sample Question, Skill 4; FC 3B]"},
    {id:"os6", q:"The cerebellum primarily coordinates:", opts:["Conscious thought and language","Voluntary movement, balance, and fine motor control","Autonomic functions (heart rate, breathing)","Hormone release"], ans:1, exp:"Cerebellum: coordinates movement precision, balance, and motor learning. Damage causes ataxia (uncoordinated movement). The medulla handles autonomic functions. [AAMC FC 3B]"},
    {id:"os7", q:"Aldosterone increases blood pressure by:", opts:["Directly constricting arterioles","Increasing Na⁺ reabsorption in the collecting duct → water follows → increased blood volume","Decreasing K⁺ reabsorption","Inhibiting renin release from the kidney"], ans:1, exp:"Aldosterone (mineralocorticoid) upregulates ENaC and Na⁺/K⁺-ATPase in the collecting duct → Na⁺ (and osmotically, water) reabsorption → blood volume → blood pressure. [AAMC FC 3C]"},
    {id:"os8", q:"Gastric chief cells secrete:", opts:["HCl","Intrinsic factor","Pepsinogen","Mucus and bicarbonate"], ans:2, exp:"Chief cells → pepsinogen (inactive). Parietal cells → HCl (activates pepsinogen → pepsin) + intrinsic factor (needed for B12 absorption). [AAMC FC 3C]"},
    {id:"os9", q:"Adaptive immunity is mediated by:", opts:["Neutrophils and macrophages","NK cells and mast cells","T and B lymphocytes","Basophils and eosinophils"], ans:2, exp:"Adaptive immunity: T cells (cell-mediated, MHC-restricted) and B cells (humoral, produce antibodies). Neutrophils and macrophages are innate immune cells. [AAMC FC 2B]"},
    {id:"os10", q:"The functional unit of the kidney is the:", opts:["Ureter","Nephron","Renal pelvis","Glomerular capsule alone"], ans:1, exp:"Each kidney has ~1 million nephrons. Each nephron: glomerulus → Bowman's capsule → PCT → loop of Henle → DCT → collecting duct. [AAMC FC 4C]"},
    {id:"os11", q:"During inhalation, air enters the lungs because:", opts:["The diaphragm pushes up, increasing lung pressure","The diaphragm contracts downward, expanding thoracic volume, reducing intrathoracic pressure below atmospheric","Atmospheric pressure decreases","Surfactant increases lung pressure"], ans:1, exp:"Diaphragm + external intercostals contract → thoracic volume increases → intrapulmonary pressure drops below atmospheric → air flows in (Boyle's Law: P₁V₁ = P₂V₂). [AAMC FC 4B]"},
    {id:"os12", q:"Which vessel carries oxygenated blood from the lungs to the heart?", opts:["Pulmonary artery","Aorta","Pulmonary vein","Superior vena cava"], ans:2, exp:"Pulmonary veins carry oxygenated blood from lungs → left atrium. Pulmonary arteries carry deoxygenated blood from right ventricle → lungs. (Veins carry blood TO the heart.) [AAMC FC 4B]"},
  ],
  behavior:[
    {id:"bh1", q:"Classical conditioning (Pavlov) involves:", opts:["Shaping behavior through rewards and punishments","Pairing a neutral stimulus with an unconditioned stimulus until the NS alone produces a response","Observing and imitating others","Unconscious conflict resolution"], ans:1, exp:"Pavlov: bell (NS/CS) + food (UCS) → salivation (UCR/CR). The NS becomes a CS by temporal association with the UCS. [AAMC FC 7C]"},
    {id:"bh2", q:"Operant conditioning differs from classical conditioning in that operant:", opts:["Involves reflex responses","Is passive","Uses consequences (reinforcement/punishment) to change voluntary behavior","Only works with animals"], ans:2, exp:"Skinner's operant conditioning: behavior is voluntary and shaped by consequences. Positive/negative reinforcement increase behavior; punishment decreases it. [AAMC FC 7C]"},
    {id:"bh3", q:"Maslow's hierarchy of needs (bottom to top) is:", opts:["Safety → Physiological → Esteem → Love → Self-actualization","Physiological → Safety → Love → Esteem → Self-actualization","Esteem → Love → Safety → Physiological → Self-actualization","Self-actualization → Esteem → Love → Safety → Physiological"], ans:1, exp:"Maslow: lower needs must be met before higher ones. Physiological (food, water, shelter) → Safety → Love/Belonging → Esteem → Self-actualization. [AAMC FC 7A]"},
    {id:"bh4", q:"Dopamine is most associated with:", opts:["Sleep regulation and circadian rhythms","Reward, motivation, and the mesolimbic pathway","Fight-or-flight response","Mood stabilization and 5-HT systems"], ans:1, exp:"Dopamine: primary neurotransmitter of the mesolimbic (reward) pathway. Implicated in motivation, pleasure, and addiction. Serotonin is associated with mood; epinephrine with fight-or-flight. [AAMC FC 7A]"},
    {id:"bh5", q:"The fight-or-flight response is driven by the:", opts:["Parasympathetic nervous system","Somatic nervous system","Sympathetic nervous system","Enteric nervous system"], ans:2, exp:"Sympathetic activation (epinephrine, norepinephrine from adrenal medulla): ↑HR, ↑BP, dilated pupils, bronchodilation, decreased digestion. Parasympathetic = 'rest and digest.' [AAMC FC 7A]"},
    {id:"bh6", q:"In a social loafing study (individual vs. group task), the independent and dependent variables are:", opts:["IV = task type; DV = group vs. individual","IV = group productivity; DV = individual contribution","IV = working alone vs. in group; DV = each participant's individual contribution","IV = working alone vs. in group; DV = the task type"], ans:2, exp:"IV = what is manipulated (group vs. individual condition); DV = what is measured (each person's effort/contribution). [AAMC Sample Question, Skill 3; FC 7B]"},
    {id:"bh7", q:"In a study, salivation to lemon juice decreases over repeated trials, then recovers when lime juice is used. This demonstrates:", opts:["Sensory perception","Habituation and dishabituation","Stimulus generalization","Conditioned responses in classical conditioning"], ans:1, exp:"Habituation = reduced responding to repeated stimulus. Dishabituation = response recovery when stimulus changes. [AAMC Sample Question, Skill 1; FC 7C]"},
    {id:"bh8", q:"Erikson's 'Identity vs. Role Confusion' stage occurs during:", opts:["Early childhood (2–3 years)","Middle childhood (6–11 years)","Adolescence (12–18 years)","Young adulthood"], ans:2, exp:"Erikson Stage 5 (adolescence): core task is forming a personal identity. Success → integrated sense of self; failure → role confusion and uncertainty about one's place in society. [AAMC FC 7A]"},
    {id:"bh9", q:"Schachter-Singer two-factor theory proposes that emotion requires:", opts:["Only physiological arousal","Only cognitive appraisal","Physiological arousal + cognitive labeling of that arousal","A learned association from conditioning"], ans:2, exp:"Two-factor theory: undifferentiated physiological arousal + a situational cognitive label = a specific emotion. The same physiological state can become fear, excitement, or anger depending on context. [AAMC FC 7A]"},
    {id:"bh10", q:"The defense mechanism of 'projection' involves:", opts:["Reverting to childlike behavior under stress","Attributing one's own unacceptable thoughts or feelings to others","Channeling impulses into socially acceptable behaviors","Refusing to consciously acknowledge a painful reality"], ans:1, exp:"Projection (Freud): unconsciously attributing unacceptable internal feelings to another person (e.g., an angry person insisting others are the hostile ones). [AAMC FC 7A]"},
    {id:"bh11", q:"Which schedule of reinforcement produces the highest response rate and greatest resistance to extinction?", opts:["Fixed interval","Fixed ratio","Variable interval","Variable ratio"], ans:3, exp:"Variable ratio schedule (e.g., slot machines): reinforcement after an unpredictable number of responses → highest and most persistent response rate. The unpredictability prevents extinction. [AAMC FC 7C]"},
  ],
  cognition:[
    {id:"cg1", q:"Working memory (Baddeley's model) is best described as:", opts:["Long-term storage of facts","Temporary active manipulation of information in consciousness","Procedural skill memory","Unconscious emotional memory"], ans:1, exp:"Working memory: limited-capacity, short-duration active system. Includes phonological loop, visuospatial sketchpad, and central executive. [AAMC FC 6B]"},
    {id:"cg2", q:"The availability heuristic leads people to:", opts:["Use statistical base rates","Estimate probability by how easily examples come to mind","Rely on expert opinion","Use systematic logic"], ans:1, exp:"Availability heuristic (Tversky & Kahneman): people judge frequency/probability by ease of recall. Vivid, recent, or dramatic events are overestimated. [AAMC FC 6B]"},
    {id:"cg3", q:"Which sleep stage is most associated with vivid dreaming and memory consolidation?", opts:["Stage 1 NREM","Stage 2 NREM","Stage 3 NREM (slow-wave/deep sleep)","REM sleep"], ans:3, exp:"REM (rapid eye movement) sleep: brain is active, muscles are paralyzed (atonia), vivid dreams occur, and emotional/procedural memories are consolidated. [AAMC FC 6B]"},
    {id:"cg4", q:"Piaget's formal operational stage (~age 12+) is characterized by:", opts:["Object permanence development","Symbolic/prelogical thinking","Abstract, hypothetical, and deductive reasoning","Parallel/solitary play"], ans:2, exp:"Formal operational: ability to reason about abstract concepts, hypothetical scenarios, and systematically test hypotheses — the most advanced cognitive stage. [AAMC FC 7A]"},
    {id:"cg5", q:"Weber's Law states that the just-noticeable difference (JND):", opts:["Is constant regardless of stimulus intensity","Is proportional to the magnitude of the original stimulus","Depends only on the type of sensory modality","Is fixed for all senses"], ans:1, exp:"Weber's Law: ΔI/I = k (Weber fraction). The JND is a constant proportion of the original stimulus. Heavier objects require bigger changes to notice a difference. [AAMC FC 6A]"},
    {id:"cg6", q:"Long-term potentiation (LTP) is the cellular mechanism for:", opts:["Sensory adaptation","Synaptic strengthening underlying learning and memory","Inhibition of neural circuits","Short-term habituation only"], ans:1, exp:"LTP: repeated high-frequency stimulation → AMPA receptor insertion + NMDA receptor activation → increased synaptic efficacy. This synaptic strengthening is the cellular basis of learning and long-term memory. [AAMC FC 7A]"},
    {id:"cg7", q:"Retrograde amnesia is the loss of:", opts:["Ability to form new memories after an injury","Memories formed before the injury","All procedural memory","Semantic memory only"], ans:1, exp:"Retrograde amnesia: loss of memories acquired before the brain injury. Anterograde amnesia: inability to form NEW memories after the injury (classic example: patient H.M. after hippocampectomy). [AAMC FC 6B]"},
    {id:"cg8", q:"Fluid intelligence differs from crystallized intelligence in that it:", opts:["Accumulates throughout life","Peaks in young adulthood and declines with age","Is stored primarily in semantic memory","Is based on cultural knowledge"], ans:1, exp:"Fluid intelligence (Cattell): novel problem-solving, abstract reasoning — peaks ~20s, declines with age. Crystallized intelligence: accumulated knowledge/vocabulary — stable or increases with age. [AAMC FC 6B]"},
    {id:"cg9", q:"Signal detection theory separates perceptual performance into:", opts:["Only stimulus strength","Sensitivity (d') and response bias (β/criterion)","Reaction time and threshold","Absolute and differential thresholds only"], ans:1, exp:"SDT: d' (d-prime) = sensitivity (ability to distinguish signal from noise); β = response bias (willingness to respond 'yes'). This separates perceptual ability from decision-making strategy. [AAMC FC 6A]"},
    {id:"cg10", q:"Inattentional blindness (Simons & Chabris 'gorilla' study) demonstrates:", opts:["Blindness outside the foveal field","Failure to notice unexpected visible stimuli when attention is focused elsewhere","Color blindness from cortical damage","Visual neglect after parietal lobe damage"], ans:1, exp:"Inattentional blindness: when observers focus on a task, salient but unexpected events are often not consciously perceived — attention is selective and resource-limited. [AAMC FC 6A]"},
  ],
  sociology:[
    {id:"sc1", q:"Social mobility based on achieved status (education, career) characterizes:", opts:["Caste system","Class system","Feudal system","Estate system"], ans:1, exp:"Class systems allow social mobility based on achieved characteristics. Caste systems (e.g., India's traditional system) are based on ascribed (birth) status with little/no mobility. [AAMC FC 9A]"},
    {id:"sc2", q:"Parsons' 'sick role' means that ill individuals:", opts:["Are blamed for their illness","Are exempt from normal duties but are obligated to seek treatment","Have no social responsibilities","Are permanently stigmatized"], ans:1, exp:"Parsons' sick role (functionalist): (1) exempted from normal responsibilities, (2) not blamed, (3) must want to get well, (4) must seek competent help. [AAMC FC 9B]"},
    {id:"sc3", q:"The process of internalizing a culture's norms and values from birth is called:", opts:["Assimilation","Socialization","Acculturation","Enculturation"], ans:3, exp:"Enculturation: absorbing the culture one is born into. Acculturation = adapting to a new culture (without fully losing the original). Socialization is broader. [AAMC FC 8A]"},
    {id:"sc4", q:"Social determinants of health include:", opts:["Genetic mutations only","Income, education, housing, neighborhood, and access to healthcare","Personal health behaviors exclusively","Biological age and sex only"], ans:1, exp:"Social determinants of health (SDOH): the conditions in which people live, work, and age — income, education, housing, food security, healthcare access — are the primary drivers of health disparities. [AAMC FC 10A]"},
    {id:"sc5", q:"Goffman's concept of 'stigma' refers to:", opts:["Upward social mobility","A deeply discrediting attribute that reduces one's social identity","A positive social label given to professionals","Cultural assimilation"], ans:1, exp:"Goffman (1963): stigma = a 'spoiled identity' — a mark of disgrace that reduces a person from a full, whole person to a discounted or lesser one in social interactions. [AAMC FC 8B]"},
    {id:"sc6", q:"Bourdieu's 'cultural capital' predicts that:", opts:["Youth cultural tastes will dominate","Cultural practices converge globally over time","Class distinctions decrease in recessions","Cultural distinctions of elite classes will be more socially valued"], ans:3, exp:"Cultural capital (Bourdieu): knowledge, skills, and tastes associated with elite/dominant classes are institutionally valued, reproducing social stratification across generations. [AAMC Sample Question, Skill 2; FC 10A]"},
    {id:"sc7", q:"Conflict theory views society as primarily characterized by:", opts:["Shared values and social consensus","Competition and struggle over scarce resources and power","Face-to-face meaning-making through symbols","Gradual adaptive evolution of social structures"], ans:1, exp:"Conflict theory (Marx, Weber): society is structured by conflict between groups competing for resources, wealth, and power. Contrasts with functionalism (consensus) and symbolic interactionism. [AAMC FC 9A]"},
    {id:"sc8", q:"Symbolic interactionism focuses on:", opts:["Large-scale structural institutions","Biological bases of social behavior","Meaning-making through symbols in everyday face-to-face interaction","Statistical patterns in population data"], ans:2, exp:"Symbolic interactionism (Mead, Blumer): micro-level perspective — people create shared meaning through symbols, language, and social interaction. Associated with stigma, sick role, and illness experience. [AAMC FC 9A]"},
    {id:"sc9", q:"Absolute poverty is defined as:", opts:["Earning below the median household income","Lacking sufficient resources for basic survival needs (food, shelter, clothing)","Being in the bottom income quintile","Earning below 60% of average income"], ans:1, exp:"Absolute poverty = unable to meet basic survival needs. Relative poverty = below a society's average standard of living. An important distinction for health disparities research. [AAMC FC 10A]"},
    {id:"sc10", q:"Implicit bias refers to:", opts:["Consciously held prejudice","Automatic unconscious attitudes that affect judgments and behavior","Institutional policies that disadvantage minority groups","Explicit discriminatory acts"], ans:1, exp:"Implicit bias: unconscious associations about social groups influencing behavior, even when a person explicitly rejects those biases. Measured by tools like the Implicit Association Test (IAT). [AAMC FC 8B]"},
    {id:"sc11", q:"Which sociological paradigm is MOST consistent with studying how a patient's rare disease affects their day-to-day social interactions and sense of self?", opts:["Functionalism","Conflict theory","Symbolic interactionism","Structural-functionalism"], ans:2, exp:"Symbolic interactionism: focuses on how individuals construct meaning through small-scale interactions — most relevant to illness experience, stigma, and self-concept. [AAMC Sample Question, Skill 2; FC 9A]"},
  ],
  research:[
    {id:"rs1", q:"An RCT is the gold standard for establishing causality because:", opts:["It is the cheapest design","Randomization controls for known and unknown confounders","It uses the largest sample sizes","It is easiest to replicate"], ans:1, exp:"Randomization distributes both known and unknown confounders equally between groups, allowing causal conclusions to be drawn. [AAMC FC Research Methods]"},
    {id:"rs2", q:"A Type I error (α) occurs when:", opts:["A real effect is missed (false negative)","A true null hypothesis is incorrectly rejected (false positive)","The wrong statistical test is used","The sample size is too small"], ans:1, exp:"Type I error = false positive: concluding an effect exists when it does not. Typically set at α = 0.05 (5% chance of false positive). [AAMC FC Research Methods]"},
    {id:"rs3", q:"A correlation of r = −0.85 indicates:", opts:["No relationship","A weak positive relationship","A strong negative (inverse) relationship","A perfect positive relationship"], ans:2, exp:"r ranges from −1 to +1. r = −0.85 = strong negative: as one variable increases, the other decreases substantially. r² = 0.72 → 72% of variance shared. [AAMC FC Research Methods]"},
    {id:"rs4", q:"The empirical rule for a normal distribution states that ~68% of data falls within:", opts:["±0.5 SD","±1 SD","±2 SD","±3 SD"], ans:1, exp:"Empirical rule: ±1 SD = ~68%, ±2 SD = ~95%, ±3 SD = ~99.7%. Critical for interpreting standard deviations and z-scores. [AAMC FC Research Methods, Skill 4]"},
    {id:"rs5", q:"Case-control studies are best suited for studying:", opts:["Common exposures in healthy populations","Rare diseases with long latency periods","Causal relationships (gold standard)","Incidence of new diseases over time"], ans:1, exp:"Case-control: starts with cases (disease+) and matched controls (disease−), then looks back at exposures. Efficient for rare diseases. Cannot calculate incidence. [AAMC FC Research Methods]"},
    {id:"rs6", q:"A Type II error (β) is:", opts:["Rejecting a true null hypothesis","Failing to detect a real effect (false negative)","A sampling error from too large a sample","Setting α too low"], ans:1, exp:"Type II error (β) = false negative: failing to detect a real effect. Statistical power (1 − β) is the probability of correctly detecting a true effect. Larger sample size reduces β. [AAMC FC Research Methods]"},
    {id:"rs7", q:"A 95% confidence interval means:", opts:["There is a 95% chance the true value is in THIS specific interval","If the study were repeated many times, 95% of such intervals would contain the true value","95% of sample data falls in the interval","The null is rejected at the 5% level — always"], ans:1, exp:"Frequentist interpretation of CI: over many repetitions of the study, 95% of constructed intervals would contain the true population parameter. It does NOT mean 95% probability the true value is in THIS interval. [AAMC FC Research Methods, Skill 4]"},
    {id:"rs8", q:"In a double-blind study:", opts:["Only participants don't know their treatment assignment","Only researchers don't know","Neither participants nor the researchers interacting with them know treatment assignment","The study uses no control group"], ans:2, exp:"Double-blind: eliminates both subject expectation effects (placebo) and researcher bias. Both the participant and the researchers who interact with/assess them are blinded to treatment. [AAMC FC Research Methods]"},
    {id:"rs9", q:"Internal validity refers to:", opts:["Generalizability of results to other populations","Whether the study accurately measures the causal relationship between IV and DV","Consistency of measurements across time","Cultural relevance of the measures used"], ans:1, exp:"Internal validity: confidence that changes in DV are caused by the IV (not confounders). External validity = generalizability. Reliability = consistency. [AAMC FC Research Methods, Skill 3]"},
    {id:"rs10", q:"An IRB (Institutional Review Board) primarily protects:", opts:["Research funding","Publication rights of researchers","The rights, safety, and welfare of human research participants","Statistical integrity of studies"], ans:2, exp:"IRBs implement the Belmont Report principles: Respect for persons (informed consent), Beneficence (minimize harm, maximize benefit), Justice (fair participant selection). [AAMC FC Research Methods, Skill 3]"},
    {id:"rs11", q:"Which measure of central tendency is most affected by extreme outliers?", opts:["Mode","Median","Mean","Standard deviation only"], ans:2, exp:"The mean is pulled toward extreme values (outliers). The median is resistant to outliers. This is why income is often reported as median household income rather than mean. [AAMC FC Research Methods, Skill 4]"},
  ],
};

// ── STORAGE ───────────────────────────────────────────────────────────────────
const K_P="mcat_prog_v4", K_C="mcat_cust_v4", K_D="mcat_day_v4";
async function sget(k){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}}
async function sset(k,v){try{await window.storage.set(k,JSON.stringify(v));}catch{}}

function initProgress(){
  const p={};
  ALL_SEGS.forEach(s=>{p[s.id]={};(SEED[s.id]||[]).forEach(q=>{p[s.id][q.id]={attempts:0,correct:0,streak:0,notes:""};});});
  return p;
}

function getAllQs(segId,custom){return[...(SEED[segId]||[]),...((custom||{})[segId]||[])];}
function calcMastery(s){if(!s||s.attempts===0)return 0;return Math.min(Math.round(((s.correct/s.attempts)*0.75+Math.min(s.streak*0.05,0.25))*100),100);}
function segStats(progress,segId,custom){
  const qs=getAllQs(segId,custom);let ta=0,tc=0,m=0;
  qs.forEach(q=>{const s=progress?.[segId]?.[q.id];if(!s)return;ta+=s.attempts;tc+=s.correct;if(calcMastery(s)>=80)m++;});
  return{totalAttempts:ta,accuracy:ta>0?Math.round(tc/ta*100):0,mastered:m,total:qs.length,masteryPct:qs.length>0?Math.round(m/qs.length*100):0};
}
function sectionStats(progress,sectionId,custom){
  const sec=SECTIONS.find(s=>s.id===sectionId);if(!sec)return{masteryPct:0,mastered:0,total:0};
  let mastered=0,total=0;
  sec.segments.forEach(sg=>{const st=segStats(progress,sg.id,custom);mastered+=st.mastered;total+=st.total;});
  return{mastered,total,masteryPct:total>0?Math.round(mastered/total*100):0};
}
function buildQueue(progress,segId,custom){
  return[...getAllQs(segId,custom)].sort((a,b)=>{
    const sa=progress?.[segId]?.[a.id]||{};const sb=progress?.[segId]?.[b.id]||{};
    const ma=calcMastery(sa),mb=calcMastery(sb);
    if(ma!==mb)return ma-mb;
    if(!sa.lastSeen)return -1;if(!sb.lastSeen)return 1;
    return new Date(sa.lastSeen)-new Date(sb.lastSeen);
  });
}
function todayKey(){return new Date().toISOString().slice(0,10);}
function last14(){return Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return d.toISOString().slice(0,10);});}

// ── STYLES ────────────────────────────────────────────────────────────────────
const btnStyle=(color,ex={})=>({background:color,border:"none",borderRadius:10,padding:"11px 18px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",...ex});
const inpStyle=(ex={})=>({background:"#0f172a",border:"1px solid #334155",borderRadius:8,padding:"10px 12px",color:"#f1f5f9",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none",...ex});

function MBar({pct,color,h=8}){
  return<div style={{background:"#1e293b",borderRadius:99,height:h,overflow:"hidden",width:"100%"}}><div style={{height:"100%",borderRadius:99,width:`${pct}%`,background:pct>=80?"#22c55e":pct>=50?color:"#64748b",transition:"width 0.6s"}}/></div>;
}

function WeeklyChart({daily}){
  const days=last14();
  const data=days.map(d=>{const e=daily?.[d]||{};return{day:d.slice(5),attempts:e.attempts||0,accuracy:(e.attempts||0)>0?Math.round((e.correct||0)/e.attempts*100):null};});
  const wk=days.slice(7);
  const wa=wk.reduce((a,d)=>a+(daily?.[d]?.attempts||0),0);
  const wc=wk.reduce((a,d)=>a+(daily?.[d]?.correct||0),0);
  const ad=wk.filter(d=>(daily?.[d]?.attempts||0)>0).length;
  return(
    <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:20,marginBottom:20}}>
      <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:12}}>📈 14-Day Activity</div>
      <div style={{display:"flex",gap:20,marginBottom:14}}>
        {[{v:wa,l:"This week",c:"#3b82f6"},{v:wa>0?`${Math.round(wc/wa*100)}%`:"0%",l:"Accuracy",c:"#22c55e"},{v:`${ad}/7`,l:"Active days",c:"#a78bfa"}].map(({v,l,c})=>(
          <div key={l}><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:11,color:"#64748b"}}>{l}</div></div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={data} margin={{top:4,right:4,left:-20,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
          <XAxis dataKey="day" tick={{fontSize:10,fill:"#64748b"}} tickLine={false}/>
          <YAxis yAxisId="l" tick={{fontSize:10,fill:"#64748b"}} tickLine={false}/>
          <YAxis yAxisId="r" orientation="right" domain={[0,100]} tick={{fontSize:10,fill:"#64748b"}} tickLine={false} unit="%"/>
          <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,fontSize:12}} labelStyle={{color:"#94a3b8"}} formatter={(v,n)=>[n==="accuracy"?`${v}%`:v,n==="accuracy"?"Accuracy":"Attempts"]}/>
          <Bar yAxisId="l" dataKey="attempts" fill="#3b82f640" radius={[4,4,0,0]}/>
          <Line yAxisId="r" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={{r:3,fill:"#22c55e"}} connectNulls={false}/>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function Notes({qId,segId,progress,onSave}){
  const saved=progress?.[segId]?.[qId]?.notes||"";
  const[editing,setEditing]=useState(false);
  const[text,setText]=useState(saved);
  useEffect(()=>{setText(saved);},[saved]);
  function save(){onSave(segId,qId,{...(progress?.[segId]?.[qId]||{attempts:0,correct:0,streak:0}),notes:text});setEditing(false);}
  return(
    <div style={{marginTop:8}}>
      {!editing
        ?<div style={{display:"flex",alignItems:"flex-start",gap:8}}>
           <div style={{flex:1,fontSize:12,color:saved?"#94a3b8":"#475569",fontStyle:saved?"normal":"italic"}}>{saved||"No notes yet"}</div>
           <button onClick={()=>{setText(saved);setEditing(true);}} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:11,flexShrink:0}}>✏️ {saved?"Edit":"Add"}</button>
         </div>
        :<div>
           <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} autoFocus style={{...inpStyle(),resize:"vertical",marginBottom:6}} placeholder="Your personal notes..."/>
           <div style={{display:"flex",gap:8}}>
             <button onClick={save} style={btnStyle("#22c55e",{fontSize:12,padding:"7px 14px"})}>Save</button>
             <button onClick={()=>setEditing(false)} style={btnStyle("#475569",{fontSize:12,padding:"7px 14px"})}>Cancel</button>
           </div>
         </div>
      }
    </div>
  );
}

function AddModal({segId,onSave,onClose}){
  const[tab,setTab]=useState("manual");
  const[form,setForm]=useState({q:"",opts:["","","",""],ans:0,exp:""});
  const[jsonText,setJsonText]=useState("");
  const[jsonErr,setJsonErr]=useState("");
  const[target,setTarget]=useState(segId||ALL_SEGS[0].id);
  function updOpt(i,v){const o=[...form.opts];o[i]=v;setForm(f=>({...f,opts:o}));}
  function saveManual(){
    if(!form.q.trim()||form.opts.some(o=>!o.trim()))return;
    onSave(target,[{id:`custom_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,...form}]);
  }
  function saveJson(){
    setJsonErr("");
    try{
      let p=JSON.parse(jsonText);if(!Array.isArray(p))p=[p];
      const v=p.filter(q=>q.q&&Array.isArray(q.opts)&&q.opts.length===4&&typeof q.ans==="number"&&q.exp);
      if(!v.length){setJsonErr("No valid questions. Each needs: q, opts[4], ans (0-3), exp.");return;}
      onSave(target,v.map((q,i)=>({...q,id:q.id||`custom_${Date.now()}_${i}`})));
    }catch(e){setJsonErr("Invalid JSON: "+e.message);}
  }
  return(
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:16,padding:24,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:16,fontWeight:700,color:"#f1f5f9"}}>Add Custom Question</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:20}}>×</button>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginBottom:5,textTransform:"uppercase"}}>Segment</div>
          <select value={target} onChange={e=>setTarget(e.target.value)} style={{...inpStyle(),paddingTop:9,paddingBottom:9}}>
            {SECTIONS.map(sec=><optgroup key={sec.id} label={`${sec.icon} ${sec.label}`}>{sec.segments.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}</optgroup>)}
          </select>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {["manual","json"].map(t=><button key={t} onClick={()=>setTab(t)} style={{...btnStyle(tab===t?"#3b82f6":"#1e293b"),flex:1,fontSize:12}}>{t==="manual"?"✏️ Manual":"📥 JSON Import"}</button>)}
        </div>
        {tab==="manual"&&<>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Question</div>
            <textarea value={form.q} onChange={e=>setForm(f=>({...f,q:e.target.value}))} rows={3} style={{...inpStyle(),resize:"vertical"}} placeholder="Enter question..."/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Options — click circle to mark correct</div>
            {form.opts.map((o,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <button onClick={()=>setForm(f=>({...f,ans:i}))} style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${form.ans===i?"#22c55e":"#334155"}`,background:form.ans===i?"#22c55e":"transparent",cursor:"pointer",flexShrink:0,color:"#fff",fontSize:10}}>{form.ans===i?"✓":["A","B","C","D"][i]}</button>
                <input value={o} onChange={e=>updOpt(i,e.target.value)} style={inpStyle()} placeholder={`Option ${["A","B","C","D"][i]}`}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Explanation</div>
            <textarea value={form.exp} onChange={e=>setForm(f=>({...f,exp:e.target.value}))} rows={2} style={{...inpStyle(),resize:"vertical"}} placeholder="Why is this correct?"/>
          </div>
          <button onClick={saveManual} disabled={!form.q.trim()||form.opts.some(o=>!o.trim())} style={btnStyle("#22c55e",{width:"100%",opacity:(!form.q.trim()||form.opts.some(o=>!o.trim()))?0.5:1})}>✓ Add Question</button>
        </>}
        {tab==="json"&&<>
          <div style={{background:"#020617",border:"1px solid #1e293b",borderRadius:8,padding:12,marginBottom:10,fontSize:11,color:"#64748b",lineHeight:1.8}}>
            Format: <code style={{color:"#94a3b8"}}>{'[{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"..."}]'}</code>
          </div>
          <textarea value={jsonText} onChange={e=>{setJsonText(e.target.value);setJsonErr("");}} rows={8} style={{...inpStyle(),resize:"vertical",fontFamily:"monospace",marginBottom:8}} placeholder='[{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"..."}]'/>
          {jsonErr&&<div style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{jsonErr}</div>}
          <button onClick={saveJson} style={btnStyle("#3b82f6",{width:"100%"})}>📥 Import Questions</button>
        </>}
      </div>
    </div>
  );
}

function QuizMode({seg,progress,custom,onUpdate,onBack,onLog}){
  const progressRef=useRef(progress);progressRef.current=progress;
  const[queue,setQueue]=useState(()=>buildQueue(progress,seg.id,custom));
  const[idx,setIdx]=useState(0);const[sel,setSel]=useState(null);
  const[showExp,setShowExp]=useState(false);const[ss,setSS]=useState({c:0,w:0,t:0});const[done,setDone]=useState(false);
  const q=queue[idx];
  function answer(i){
    if(sel!==null||!q)return;setSel(i);setShowExp(true);
    const ok=i===q.ans;
    const prev=progressRef.current?.[seg.id]?.[q.id]||{attempts:0,correct:0,streak:0,notes:""};
    onUpdate(seg.id,q.id,{...prev,attempts:prev.attempts+1,correct:prev.correct+(ok?1:0),streak:ok?prev.streak+1:0,lastSeen:new Date().toISOString()});
    onLog(ok);setSS(s=>({c:s.c+(ok?1:0),w:s.w+(ok?0:1),t:s.t+1}));
  }
  function next(){if(idx+1>=queue.length){setDone(true);return;}setIdx(i=>i+1);setSel(null);setShowExp(false);}
  function restart(){setQueue(buildQueue(progressRef.current,seg.id,custom));setIdx(0);setSel(null);setShowExp(false);setSS({c:0,w:0,t:0});setDone(false);}
  if(done)return(
    <div style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:48,marginBottom:16}}>🎉</div>
      <div style={{fontSize:22,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>Session Complete!</div>
      <div style={{fontSize:15,color:"#94a3b8",marginBottom:24}}>{ss.c}/{ss.t} correct ({ss.t>0?Math.round(ss.c/ss.t*100):0}%)</div>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <button onClick={restart} style={btnStyle(seg.color)}>Study Again</button>
        <button onClick={onBack} style={btnStyle("#475569")}>Back</button>
      </div>
    </div>
  );
  if (!q) return (
    <div style={{color:"#64748b",textAlign:"center",padding:40}}>No questions available.</div>
  );
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13}}>← Back</button>
        <div style={{display:"flex",gap:14,fontSize:12}}><span style={{color:"#22c55e"}}>✓ {ss.c}</span><span style={{color:"#ef4444"}}>✗ {ss.w}</span><span style={{color:"#64748b"}}>{idx+1}/{queue.length}</span></div>
      </div>
      <div style={{height:4,background:"#1e293b",borderRadius:99,marginBottom:18,overflow:"hidden"}}><div style={{height:"100%",width:`${((idx+1)/queue.length)*100}%`,background:seg.color,transition:"width 0.4s"}}/></div>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:22,marginBottom:14}}>
        <div style={{fontSize:11,color:seg.color,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{seg.label}</div>
        <div style={{fontSize:15,color:"#f1f5f9",lineHeight:1.7}}>{q.q}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {q.opts.map((opt,i)=>{
          let bg="#0f172a",border="#1e293b",color="#cbd5e1";
          if(sel!==null){if(i===q.ans){bg="#14532d";border="#22c55e";color="#86efac";}else if(i===sel){bg="#450a0a";border="#ef4444";color="#fca5a5";}}
          return<button key={i} onClick={()=>answer(i)} style={{background:bg,border:`1px solid ${border}`,borderRadius:10,padding:"13px 16px",color,fontSize:13,textAlign:"left",cursor:sel!==null?"default":"pointer",transition:"all 0.2s"}}>
            <span style={{marginRight:8,fontWeight:700,opacity:0.5}}>{["A","B","C","D"][i]}.</span>{opt}
          </button>;
        })}
      </div>
      {showExp&&<div style={{background:sel===q.ans?"#14532d30":"#450a0a30",border:`1px solid ${sel===q.ans?"#22c55e40":"#ef444440"}`,borderRadius:10,padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:sel===q.ans?"#22c55e":"#ef4444",marginBottom:6}}>{sel===q.ans?"✓ Correct!":"✗ Incorrect"}</div>
        <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6,marginBottom:10}}>{q.exp}</div>
        <div style={{borderTop:"1px solid #1e293b",paddingTop:10}}>
          <div style={{fontSize:10,color:"#475569",fontWeight:600,marginBottom:4}}>📝 NOTES</div>
          <Notes qId={q.id} segId={seg.id} progress={progress} onSave={onUpdate}/>
        </div>
      </div>}
      {sel!==null&&<button onClick={next} style={btnStyle(seg.color,{width:"100%"})}>{idx+1>=queue.length?"Finish Session →":"Next Question →"}</button>}
    </div>
  );
}

function FlashMode({seg,progress,custom,onUpdate,onBack,onLog}){
  const progressRef=useRef(progress);progressRef.current=progress;
  const[queue]=useState(()=>buildQueue(progress,seg.id,custom));
  const[idx,setIdx]=useState(0);const[flip,setFlip]=useState(false);const[showNote,setShowNote]=useState(false);
  const q=queue[idx];
  if (!q) return (
    <div style={{color:"#64748b",textAlign:"center",padding:40}}>No questions available.</div>
  );
  const stat=progressRef.current?.[seg.id]?.[q.id]||{attempts:0,correct:0,streak:0,notes:""};
  const m=calcMastery(stat);
  function rate(ok){
    const s=progressRef.current?.[seg.id]?.[q.id]||{attempts:0,correct:0,streak:0,notes:""};
    onUpdate(seg.id,q.id,{...s,attempts:s.attempts+1,correct:s.correct+(ok?1:0),streak:ok?s.streak+1:0,lastSeen:new Date().toISOString()});
    onLog(ok);setFlip(false);setShowNote(false);setTimeout(()=>setIdx(i=>(i+1)%queue.length),50);
  }
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13}}>← Back</button>
        <span style={{fontSize:12,color:"#64748b"}}>{idx+1}/{queue.length}</span>
      </div>
      <div onClick={()=>setFlip(f=>!f)} style={{background:flip?`${seg.color}15`:"#0f172a",border:`1px solid ${flip?seg.color:"#1e293b"}`,borderRadius:16,padding:"36px 28px",minHeight:200,cursor:"pointer",transition:"all 0.3s",marginBottom:12,position:"relative"}}>
        <div style={{position:"absolute",top:14,right:16,fontSize:11,color:"#475569"}}>{flip?"Answer":"Tap to flip"}</div>
        {!flip?<><div style={{fontSize:11,color:seg.color,fontWeight:600,marginBottom:10,textTransform:"uppercase"}}>Question</div><div style={{fontSize:15,color:"#f1f5f9",lineHeight:1.7}}>{q.q}</div></>
        :<><div style={{fontSize:11,color:"#22c55e",fontWeight:600,marginBottom:10,textTransform:"uppercase"}}>Answer</div><div style={{fontSize:15,color:"#86efac",lineHeight:1.7,marginBottom:10}}>{q.opts[q.ans]}</div><div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>{q.exp}</div></>}
        <div style={{marginTop:20}}><MBar pct={m} color={seg.color} h={4}/><div style={{fontSize:11,color:"#475569",marginTop:4}}>Mastery {m}% · Streak {stat.streak} 🔥</div></div>
      </div>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",marginBottom:10,cursor:"pointer"}} onClick={()=>setShowNote(n=>!n)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:"#64748b"}}>📝 {stat.notes?stat.notes.slice(0,45)+(stat.notes.length>45?"…":""):"Add notes"}</span>
          <span style={{fontSize:11,color:"#475569"}}>{showNote?"▲":"▼"}</span>
        </div>
        {showNote&&<div style={{marginTop:10}} onClick={e=>e.stopPropagation()}><Notes qId={q.id} segId={seg.id} progress={progress} onSave={onUpdate}/></div>}
      </div>
      {flip&&<div style={{display:"flex",gap:12}}><button onClick={()=>rate(false)} style={{...btnStyle("#ef4444"),flex:1}}>✗ Hard</button><button onClick={()=>rate(true)} style={{...btnStyle("#22c55e"),flex:1}}>✓ Got It</button></div>}
    </div>
  );
}

function SegDetail({seg,progress,custom,onBack,onUpdate,onCustomSave,onLog}){
  const[mode,setMode]=useState(null);const[showAdd,setShowAdd]=useState(false);
  if(mode==="quiz")return<QuizMode seg={seg} progress={progress} custom={custom} onUpdate={onUpdate} onBack={()=>setMode(null)} onLog={onLog}/>;
  if(mode==="flash")return<FlashMode seg={seg} progress={progress} custom={custom} onUpdate={onUpdate} onBack={()=>setMode(null)} onLog={onLog}/>;
  const qs=getAllQs(seg.id,custom);const stats=segStats(progress,seg.id,custom);
  return(
    <div>
      {showAdd&&<AddModal segId={seg.id} onSave={(sid,qs)=>{onCustomSave(sid,qs);setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div style={{fontSize:20,fontWeight:900,color:"#f1f5f9",letterSpacing:"-0.5px"}}>genius<span style={{color:"#3b82f6"}}>.</span></div>
      </div>
      <div style={{fontSize:10,color:"#475569",letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:16}}>MCAT Exam Study</div>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13,marginBottom:16,padding:0}}>← Back</button>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:26}}>{seg.icon}</span>
          <div><div style={{fontSize:17,fontWeight:700,color:"#f1f5f9"}}>{seg.label}</div><div style={{fontSize:12,color:"#64748b"}}>{stats.mastered}/{stats.total} mastered</div></div>
        </div>
        <button onClick={()=>setShowAdd(true)} style={btnStyle("#3b82f6",{fontSize:12,padding:"8px 12px"})}>+ Add Q</button>
      </div>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          {[["Mastery",`${stats.masteryPct}%`,seg.color],["Accuracy",`${stats.accuracy}%`,"#f1f5f9"],["Attempts",stats.totalAttempts,"#f1f5f9"]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:11,color:"#64748b"}}>{l}</div></div>
          ))}
        </div>
        <MBar pct={stats.masteryPct} color={seg.color} h={10}/>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:22}}>
        <button onClick={()=>setMode("quiz")} style={{...btnStyle(seg.color),flex:1,padding:14}}>📝 Quiz Mode</button>
        <button onClick={()=>setMode("flash")} style={{...btnStyle("#8b5cf6"),flex:1,padding:14}}>🃏 Flashcards</button>
      </div>
      <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>Questions</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {qs.map(q=>{
          const s=progress?.[seg.id]?.[q.id]||{attempts:0,correct:0,streak:0,notes:""};const m=calcMastery(s);
          return(
            <div key={q.id} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                <div style={{fontSize:13,color:"#cbd5e1",lineHeight:1.5,flex:1}}>{q.q}</div>
                {q.id.startsWith("custom_")&&<span style={{fontSize:10,background:"#1e293b",color:"#64748b",borderRadius:4,padding:"2px 6px",flexShrink:0}}>custom</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
                <div style={{flex:1}}><MBar pct={m} color={seg.color} h={6}/></div>
                <span style={{fontSize:11,color:m>=80?"#22c55e":"#64748b",minWidth:70,textAlign:"right"}}>{s.attempts>0?`${m}% · ${s.streak}🔥`:"Unseen"}</span>
              </div>
              <div style={{borderTop:"1px solid #ffffff08",marginTop:10,paddingTop:8}}>
                <div style={{fontSize:10,color:"#475569",fontWeight:600,marginBottom:4}}>📝 NOTES</div>
                <Notes qId={q.id} segId={seg.id} progress={progress} onSave={onUpdate}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard({progress,custom,daily,onSelect}){
  const overall=ALL_SEGS.reduce((a,s)=>{const st=segStats(progress,s.id,custom);a.m+=st.mastered;a.t+=st.total;a.at+=st.totalAttempts;return a;},{m:0,t:0,at:0});
  const op=overall.t>0?Math.round(overall.m/overall.t*100):0;
  return(
    <div>
      <div style={{marginBottom:22}}>
        <div style={{fontSize:28,fontWeight:900,color:"#f1f5f9",letterSpacing:"-1px"}}>genius<span style={{color:"#3b82f6"}}>.</span></div>
        <div style={{fontSize:11,color:"#475569",letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginTop:3}}>MCAT Exam Study</div>
      </div>
      <div style={{background:"linear-gradient(135deg,#1e3a5f,#0f172a)",border:"1px solid #1e40af",borderRadius:14,padding:20,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
          <div><div style={{fontSize:12,color:"#93c5fd",marginBottom:2}}>Overall Mastery</div><div style={{fontSize:32,fontWeight:800,color:"#f1f5f9"}}>{op}%</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:12,color:"#64748b"}}>{overall.m}/{overall.t} mastered</div><div style={{fontSize:12,color:"#64748b"}}>{overall.at} attempts</div></div>
        </div>
        <MBar pct={op} color="#3b82f6" h={10}/>
      </div>
      <WeeklyChart daily={daily}/>
      {SECTIONS.map(sec=>{
        const ss=sectionStats(progress,sec.id,custom);
        return(
          <div key={sec.id} style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{sec.icon}</span>
                <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9"}}>{sec.label}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:80}}><MBar pct={ss.masteryPct} color={sec.color} h={6}/></div>
                <span style={{fontSize:11,color:"#64748b",minWidth:36,textAlign:"right"}}>{ss.masteryPct}%</span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {sec.segments.map(seg=>{
                const st=segStats(progress,seg.id,custom);
                return(
                  <div key={seg.id} onClick={()=>onSelect(seg)} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:14,cursor:"pointer",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,width:`${st.masteryPct}%`,height:3,background:seg.color,transition:"width 0.6s"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <span style={{fontSize:18}}>{seg.icon}</span>
                      <span style={{fontSize:10,color:st.masteryPct>=80?"#22c55e":"#64748b",fontWeight:600}}>{st.mastered}/{st.total}</span>
                    </div>
                    <div style={{fontSize:12,fontWeight:600,color:"#f1f5f9",marginBottom:6,lineHeight:1.4}}>{seg.label}</div>
                    <MBar pct={st.masteryPct} color={seg.color} h={5}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:10,color:"#64748b"}}>
                      <span>{st.masteryPct}%</span>
                      <span>{st.totalAttempts>0?`${st.accuracy}% acc`:"Start"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{padding:14,background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,fontSize:12,color:"#64748b",lineHeight:1.7}}>
        💡 <strong style={{color:"#94a3b8"}}>Tip:</strong> Questions are sorted by lowest mastery first (spaced repetition). Aim for 80%+ per segment before test day. Use <strong style={{color:"#94a3b8"}}>+ Add Q</strong> inside any segment to import your own questions from Kaplan, Princeton Review, or UWorld via JSON.
      </div>
    </div>
  );
}

export default function App(){
  const[progress,setProgress]=useState(null);
  const[custom,setCustom]=useState({});
  const[daily,setDaily]=useState({});
  const[activeSeg,setActive]=useState(null);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([sget(K_P),sget(K_C),sget(K_D)]).then(([p,c,d])=>{
      const base=p||initProgress();
      ALL_SEGS.forEach(s=>{
        if(!base[s.id])base[s.id]={};
        (SEED[s.id]||[]).forEach(q=>{if(!base[s.id][q.id])base[s.id][q.id]={attempts:0,correct:0,streak:0,notes:""};}); 
      });
      setProgress(base);setCustom(c||{});setDaily(d||{});setLoading(false);
    });
  },[]);

  const handleUpdate=useCallback((segId,qId,stat)=>{
    setProgress(prev=>{const next={...prev,[segId]:{...prev[segId],[qId]:stat}};sset(K_P,next);return next;});
  },[]);
  const handleCustomSave=useCallback((segId,newQs)=>{
    setCustom(prev=>{const next={...prev,[segId]:[...(prev[segId]||[]),...newQs]};sset(K_C,next);return next;});
    setProgress(prev=>{const seg={...prev[segId]};newQs.forEach(q=>{if(!seg[q.id])seg[q.id]={attempts:0,correct:0,streak:0,notes:""};});const next={...prev,[segId]:seg};sset(K_P,next);return next;});
  },[]);
  const handleLog=useCallback((ok)=>{
    const key=todayKey();
    setDaily(prev=>{const t=prev[key]||{attempts:0,correct:0};const next={...prev,[key]:{attempts:t.attempts+1,correct:t.correct+(ok?1:0)}};sset(K_D,next);return next;});
  },[]);

  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#020617",color:"#64748b"}}>Loading…</div>;

  const seg=activeSeg?ALL_SEGS.find(s=>s.id===activeSeg):null;
  return(
    <div style={{background:"#020617",minHeight:"100vh",padding:"24px 20px",maxWidth:600,margin:"0 auto",fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"}}>
      {!activeSeg||!seg
        ?<Dashboard progress={progress} custom={custom} daily={daily} onSelect={s=>setActive(s.id)}/>
        :<SegDetail seg={seg} progress={progress} custom={custom} onBack={()=>setActive(null)} onUpdate={handleUpdate} onCustomSave={handleCustomSave} onLog={handleLog}/>
      }
    </div>
  );
}