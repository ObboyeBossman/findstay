package com.findstay.testing;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The requirement this test proves (the S1-01-T12 convention; Definition of
 * Done check 2).
 *
 * <p>Every test class carries either a class-level {@code @Req} (covering all
 * its test methods) or a {@code @Req} on each test method. The rule is
 * enforced by {@link RequirementTaggingTest}, which fails the build when it
 * finds an unlabelled test — an unlabelled test proves nothing anyone can
 * trace.
 *
 * <p>Accepted values (whichever document pins the behaviour):
 * <ul>
 *   <li>a requirement id — {@code FR-xx}, {@code NFR-xx}, {@code SEC-xx},
 *       {@code BRL-xx}, {@code UR-xx}, {@code UI-xx}, {@code TA-xx},
 *       {@code J-xx}, {@code P-xx}</li>
 *   <li>a decision id — {@code DEC-S1-01/A}…</li>
 *   <li>a story acceptance-criterion reference — {@code S1-08-AC2}</li>
 *   <li>a sprint invariant — {@code C1}…{@code C8} (scrum rules §4)</li>
 *   <li>a foundation-task id, for setup/harness proof — {@code S1-01-T7}</li>
 * </ul>
 *
 * <p>Example:
 * <pre>{@code
 * @Req("NFR-38")
 * class BookingDoubleBookIntegrationTest extends AbstractIntegrationTest { … }
 * }</pre>
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Req {

    /** The requirement, decision or AC reference this test proves. */
    String value();
}
