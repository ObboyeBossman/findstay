/**
 * Shared kernel: the small set of building blocks every feature module uses.
 *
 * <ul>
 *   <li>{@code money} - {@link com.findstay.shared.money.Money}, whole pesewas, never floating point</li>
 *   <li>{@code time} - UTC {@code Clock}, Ghana-time display helpers</li>
 *   <li>{@code error} - the standard error shape and exception handler</li>
 *   <li>{@code id} - time-ordered UUIDv7 identifiers</li>
 *   <li>{@code event} - domain events</li>
 *   <li>{@code job} - background jobs</li>
 * </ul>
 *
 * The module is OPEN so feature modules may use any type in it without extra declarations.
 * Keep it small: only genuinely cross-cutting code belongs here, never business rules.
 */
@ApplicationModule(type = ApplicationModule.Type.OPEN)
package com.findstay.shared;

import org.springframework.modulith.ApplicationModule;
