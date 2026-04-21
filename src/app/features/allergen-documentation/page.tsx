import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Allergen Documentation — UK & EU HACCP Records | PinkPepper",
  description:
    "Build the full allergen documentation pack your HACCP plan requires: supplier matrices, version-controlled recipes, PPDS labels, changeover logs, and enquiry records — aligned with EU 1169/2011 and Natasha's Law.",
  alternates: {
    canonical: "https://www.pinkpepper.io/features/allergen-documentation",
  },
};

export default function AllergenDocumentationPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="border-b border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-24">
        <div className="pp-container max-w-5xl">
          <div className="pp-article-hero-meta max-w-4xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">Allergen management</p>
            <h1 className="pp-display mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-[#0F172A] md:text-6xl">
              The Paper Trail of Safety: Allergen Documentation in HACCP
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#475569]">
              A guide to the documentation UK and EU law requires — supplier matrices, version-controlled recipes, PPDS labels, changeover records, and the enquiry log that protects you in court.
            </p>
          </div>
          <figure className="mt-10 overflow-hidden rounded-[30px] border border-[#E2E8F0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <Image
              src="https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1600&q=80"
              alt="Chef checking ingredients during food preparation"
              width={1600}
              height={900}
              className="h-auto w-full object-cover"
              priority
            />
          </figure>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <div className="pp-article-body max-w-none">

            <p>In the hierarchy of food safety hazards, allergens occupy a unique and unforgiving space. Unlike a bacterial contaminant that might cause illness in 24 hours, an allergen can trigger <strong>anaphylaxis within minutes</strong>. Legally, in both the UK and the EU, the provision of food containing an undeclared allergen is not treated as a quality issue&mdash;it is treated as <strong>food fraud and a criminal offence</strong>.</p>

            <p>For a Food Business Operator (FBO), the defence against prosecution or civil litigation rests entirely on <strong>documentation</strong>. You cannot &ldquo;see&rdquo; an allergen the way you can see dirt. You can only prove its absence or controlled presence through <strong>written records</strong>. This article outlines the essential documents required for a legally compliant HACCP-based allergen management system under <strong>Regulation (EU) No 1169/2011 (FIC)</strong> and <strong>Natasha&rsquo;s Law</strong> (UK).</p>

            <h2>Part 1: The Legal Foundation &mdash; Why Documentation Is Non-Negotiable</h2>

            <p>In the UK and EU, the law requires you to provide accurate information about the <strong>14 Mandatory Allergens</strong> (cereals containing gluten, crustaceans, eggs, fish, peanuts, soybeans, milk, nuts, celery, mustard, sesame, sulphites, lupin, and molluscs).</p>

            <ul>
              <li><strong>Burden of Proof:</strong> Under the <strong>Food Safety Act 1990 (UK)</strong> and <strong>Regulation (EC) 178/2002 (EU)</strong>, the defendant &mdash; the food business &mdash; must prove they took all reasonable precautions (Due Diligence).</li>
              <li><strong>The Consequence of Missing Paperwork:</strong> If a customer has an allergic reaction and you cannot produce a Recipe Specification or Supplier Allergen Statement, you have no defence in court. Fines in the UK for corporate manslaughter relating to allergen deaths now exceed <strong>&pound;1 million</strong>.</li>
            </ul>

            <h2>Part 2: The Mandatory Allergen Documentation Pack</h2>

            <p>An EHO or BRCGS auditor will expect to see a <strong>live</strong> suite of documents. These are not &ldquo;set and forget&rdquo; items; they must be reviewed every time a supplier or recipe changes.</p>

            <h3>1. The Allergen Risk Assessment (The HACCP Foundation)</h3>

            <p>Before you write a menu or make a sandwich, you must document the risk.</p>

            <ul>
              <li><strong>Document Name:</strong> HACCP Allergen Hazard Analysis</li>
              <li><strong>Ingredient Breakdown:</strong> Every raw material listed with its allergen status (Intentionally Present, Cross-Contact Risk, Free From).</li>
              <li><strong>Process Flow Mapping:</strong> Identify points where cross-contact is possible (e.g., &ldquo;Step 3: Slicing bread on shared board after nut bread&rdquo;).</li>
              <li><strong>UK/EU Nuance:</strong> This document must address Precautionary Allergen Labelling (PAL). You cannot use PAL to cover up poor cleaning. The risk assessment must justify <em>why</em> PAL is needed (e.g., &ldquo;Supplier cannot guarantee nut-free due to shared line&rdquo;).</li>
            </ul>

            <h3>2. The Approved Supplier Allergen Matrix</h3>

            <p>This is the single most important document in an investigation.</p>

            <ul>
              <li><strong>What it is:</strong> A spreadsheet or database listing every product you buy, cross-referenced against the 14 allergens.</li>
              <li><strong>Why generic specs fail:</strong> Accepting a product spec sheet from a supplier dated two years ago is <strong>not</strong> due diligence.</li>
              <li><strong>Annual Re-Confirmation:</strong> You need written confirmation from the supplier dated <strong>within the last 12 months</strong> confirming allergen status has not changed.</li>
              <li><strong>Change Notification Clause:</strong> Documented proof that you require the supplier to notify you <strong>immediately</strong> (minimum 24 hours) if they change a recipe to include an allergen.</li>
            </ul>

            <h3>3. Internal Recipe Specifications (The Blueprint)</h3>

            <ul>
              <li><strong>Document Name:</strong> Finished Product Specification / Recipe Card</li>
              <li><strong>Sub-Recipe Mapping:</strong> If you use a compound ingredient like &ldquo;Cake Mix,&rdquo; the spec must list its sub-ingredients (Flour = Gluten, Egg = Egg).</li>
              <li><strong>Version Control:</strong> If you change from one mayonnaise brand to another, update the version number and date. If you switch to a vegan mayo with no egg, this requires a full reprint of labels and menus plus a new version number. <em>Failure to update version control is a Major NC.</em></li>
            </ul>

            <h3>4. The Allergen Matrix Chart (Visual Management)</h3>

            <p>The wall chart posted in the kitchen must match the Master Document exactly. If you update the master spreadsheet but forget to reprint the wall chart, you have a Non-Conformity. Both must be current and consistent.</p>

            <h2>Part 3: Documentation for Natasha&rsquo;s Law (PPDS) &mdash; UK Specific</h2>

            <p>The <strong>UK Food Information (Amendment) Regulations 2019</strong> (Natasha&rsquo;s Law) created specific documentation requirements for <strong>Prepacked for Direct Sale (PPDS)</strong> foods &mdash; items made on site and wrapped before the customer orders (e.g., a pre-wrapped sandwich in a coffee shop fridge).</p>

            <ul>
              <li><strong>The PPDS Label Record:</strong> Retain a digital or physical copy of the exact label applied to that batch. The label must carry the product name plus a full ingredients list with allergens emphasised in bold. Minimum retention period: <strong>3 months</strong> after the Use By date.</li>
              <li><strong>Batch Coding Log:</strong> Document a link between the batch code on the label and the production date and recipe version used. Example: <em>&ldquo;Batch 2404A &mdash; Ham Sandwich &mdash; Recipe v3.1 (01/04/24) &mdash; Contains Wheat, Milk.&rdquo;</em></li>
            </ul>

            <h2>Part 4: Documenting the CCP for Allergen Control</h2>

            <p>In HACCP, allergen control is typically managed as a Critical Control Point (CCP) or a strict Operational Prerequisite Program (oPRP). The monitoring records for this step must be meticulous.</p>

            <p><strong>The Changeover Cleaning Record (&ldquo;All Clear&rdquo; Sheet)</strong> &mdash; when switching from a nut-containing product to a nut-free product on a slicing line, the following documented evidence is required:</p>

            <ol>
              <li><strong>Cleaning Method Statement:</strong> Documented procedure for allergen cleaning (e.g., &ldquo;Strip down to component parts. Wash with detergent at 60&deg;C. Rinse.&rdquo;).</li>
              <li><strong>Visual Inspection Sign-Off:</strong> Signed by the supervisor to confirm the machine is visually clean.</li>
              <li><strong>Swab Verification (Best Practice):</strong> Allergen rapid test (lateral flow) result logged in the record. A negative swab result is the gold standard of legal defence.</li>
              <li><strong>Pre-Production Check:</strong> Signed by the operator confirming the line is clear of previous ingredients before starting the new batch.</li>
            </ol>

            <h2>Part 5: Common Documentation Failures</h2>

            <table>
              <thead>
                <tr>
                  <th>The Failure</th>
                  <th>The Legal Consequence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Missing ingredient spec for a &ldquo;one-off&rdquo; garnish</strong></td>
                  <td>You bought sesame seeds for a salad. Where is the spec? No spec = Major NC with no due diligence defence.</td>
                </tr>
                <tr>
                  <td><strong>Generic &ldquo;May Contain&rdquo; without a risk assessment</strong></td>
                  <td>Overuse of PAL is prohibited. You must demonstrate you tried to source a nut-free alternative. Document that search.</td>
                </tr>
                <tr>
                  <td><strong>Discrepancy between menu and pack</strong></td>
                  <td>Menu says &ldquo;Contains Milk.&rdquo; Label says &ldquo;May Contain Milk.&rdquo; The EHO will issue a notice to correct the inconsistency.</td>
                </tr>
                <tr>
                  <td><strong>Not documenting verbal allergen warnings</strong></td>
                  <td>A customer asks &ldquo;Is this nut free?&rdquo; and you advise them it is not. Write it down. Record the refusal of service in the Allergen Enquiry Log.</td>
                </tr>
              </tbody>
            </table>

            <h2>Part 6: The Allergen Enquiry Log</h2>

            <p>This document is often overlooked until it is needed in court. Its purpose is to record every conversation with a customer about their allergen requirements.</p>

            <p><strong>What to log:</strong> date and time; allergen concerned; staff member answering; the response given (e.g., <em>&ldquo;Advised customer that dish contains Wheat and Sulphites. Customer chose alternative dish.&rdquo;</em>).</p>

            <p><strong>Why this record is essential:</strong> if a customer later claims you confirmed a dish was gluten-free when it was not, a contemporaneous log entry is the evidence that wins the case. Without it, the dispute becomes your word against theirs.</p>

            <h2>Document to Protect</h2>

            <p>Allergen documentation is demanding, but it is the only barrier between a busy service and a criminal investigation. In the UK and EU, the expectation has shifted from &ldquo;trusting the chef&rdquo; to &ldquo;proving the process.&rdquo;</p>

            <p>Ensure your HACCP folder contains: a current supplier matrix (under 12 months old); version-controlled recipe specifications; signed cleaning and changeover logs; and a copy of every label produced under Natasha&rsquo;s Law.</p>

            <p>If it isn&rsquo;t written down, it didn&rsquo;t happen. And in the case of allergens, if it didn&rsquo;t happen on paper, the law presumes it didn&rsquo;t happen in the kitchen.</p>

            <p><Link href="/signup">Start building your allergen documentation pack today.</Link></p>

          </div>
        </div>
      </section>

      {/* Related links */}
      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
        <div className="pp-container max-w-5xl">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">Continue reading</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A]">Related pages</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                href: "/features/haccp-plan-generator",
                label: "HACCP plan generator",
                description: "Connect allergen controls to broader hazard analysis and monitoring workflows.",
              },
              {
                href: "/features/food-safety-sop-generator",
                label: "Food safety SOP generator",
                description: "Document handwashing, cleaning, segregation, and label verification procedures.",
              },
              {
                href: "/pricing",
                label: "Pricing",
                description: "Compare plans for document generation, export, and food safety consultancy.",
              },
            ].map((link) => (
              <div
                key={link.href}
                className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
              >
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">PinkPepper</p>
                <h3 className="mt-3 text-xl font-bold leading-tight text-[#0F172A]">
                  <Link href={link.href} className="transition-colors hover:text-[#BE123C]">
                    {link.label}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#475569]">{link.description}</p>
                <div className="mt-5 border-t border-[#F1F5F9] pt-4">
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#FDA4AF] hover:text-[#BE123C]"
                  >
                    <span>Read more</span>
                    <span aria-hidden="true">+</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
