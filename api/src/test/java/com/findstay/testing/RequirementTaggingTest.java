package com.findstay.testing;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Enforces the S1-01-T12 rule: <b>every test is labelled with the requirement
 * it proves</b> via {@link Req}. Any test class with JUnit test methods that
 * carries neither a class-level {@code @Req} nor one on every test method
 * fails this check — so an unlabelled test fails the build, here and in CI.
 *
 * <p>The check proves itself: {@link DeliberatelyUntaggedSample} and
 * {@link DeliberatelyBlankLabelSample} below are real, broken test classes,
 * and the tests assert the detector flags exactly them. (The global scan
 * skips classes whose simple name starts with {@code Deliberately} — they
 * exist only to keep this proof alive.)
 *
 * <p>Accepted label values and the convention are documented on {@link Req}.
 */
@Req("S1-01-T12")
class RequirementTaggingTest {

    private static final String[] TEST_ANNOTATIONS = {
            "org.junit.jupiter.api.Test",
            "org.junit.jupiter.params.ParameterizedTest",
            "org.junit.jupiter.api.TestFactory",
            "org.junit.jupiter.api.RepeatedTest",
    };

    /** A deliberately unlabelled test class — the detector must catch this. */
    static class DeliberatelyUntaggedSample {
        @Test
        void thisTestHasNoReqLabel() {
            // never runs (no @Nested, so no runner picks it up); it exists to be detected.
        }
    }

    /** A blank label is as bad as none — the detector must not accept it. */
    @Req("   ")
    static class DeliberatelyBlankLabelSample {
        @Test
        void aBlankLabelIsNotALabel() {
        }
    }

    @Test
    void everyTestInTheSuiteCarriesItsRequirementLabel() throws IOException {
        List<Class<?>> realTests = allCompiledTestClasses().stream()
                .filter(c -> !c.getSimpleName().startsWith("Deliberately")) // the self-proof samples
                .toList();
        List<String> violations = violationsIn(realTests);
        assertTrue(violations.isEmpty(),
                () -> "Unlabelled tests found (add @Req(\"...\") — see com.findstay.testing.Req):\n  "
                        + String.join("\n  ", violations));
    }

    @Test
    void anUnlabelledTestIsActuallyDetected() {
        assertEquals(
                List.of(DeliberatelyUntaggedSample.class.getName() + " :: thisTestHasNoReqLabel"),
                violationsIn(List.of(DeliberatelyUntaggedSample.class)),
                "the detector must flag unlabelled tests — otherwise this rule proves nothing");
    }

    @Test
    void aBlankLabelDoesNotCountAsALabel() {
        List<String> flagged = violationsIn(List.of(DeliberatelyBlankLabelSample.class));
        assertEquals(1, flagged.size(), "blank @Req values must be flagged: " + flagged);
    }

    // ------------------------------------------------------------------
    // detection
    // ------------------------------------------------------------------

    private static List<Class<?>> allCompiledTestClasses() throws IOException {
        Path root = Path.of("target", "test-classes");
        assertTrue(Files.isDirectory(root),
                "compiled test classes not found at " + root.toAbsolutePath()
                        + " — run with mvn test / the IDE build");
        List<Class<?>> classes = new ArrayList<>();
        try (Stream<Path> files = Files.walk(root)) {
            files.filter(p -> p.toString().endsWith(".class"))
                    .forEach(p -> classes.add(load(root, p)));
        }
        assertFalse(classes.isEmpty(), "no compiled test classes found under " + root);
        return classes;
    }

    private static Class<?> load(Path root, Path classFile) {
        String name = root.relativize(classFile).toString()
                .replace(java.io.File.separatorChar, '.').replaceAll("\\.class$", "");
        try {
            return Class.forName(name);
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("cannot load compiled test class " + name, e);
        }
    }

    /** @return violation descriptions for the given classes, empty when clean. */
    private static List<String> violationsIn(List<Class<?>> classes) {
        List<String> violations = new ArrayList<>();
        for (Class<?> clazz : classes) {
            if (testMethodsOf(clazz).isEmpty()) {
                continue; // not a test class; nothing to label
            }
            if (classReqOf(clazz) != null) {
                continue; // class-level label covers every method
            }
            for (Method m : testMethodsOf(clazz)) {
                if (reqValue(m.getAnnotation(Req.class)) == null) {
                    violations.add(clazz.getName() + " :: " + m.getName());
                }
            }
        }
        return violations;
    }

    private static String classReqOf(Class<?> clazz) {
        for (Class<?> c = clazz; c != null && c != Object.class; c = c.getSuperclass()) {
            String label = reqValue(c.getAnnotation(Req.class));
            if (label != null) {
                return label;
            }
        }
        return null;
    }

    private static List<Method> testMethodsOf(Class<?> clazz) {
        List<Method> methods = new ArrayList<>();
        for (Class<?> c = clazz; c != null && c != Object.class; c = c.getSuperclass()) {
            for (Method m : c.getDeclaredMethods()) {
                if (Arrays.stream(m.getAnnotations())
                        .anyMatch(a -> Arrays.asList(TEST_ANNOTATIONS)
                                .contains(a.annotationType().getName()))) {
                    methods.add(m);
                }
            }
        }
        return methods;
    }

    private static String reqValue(Req req) {
        if (req == null) {
            return null;
        }
        String value = req.value() == null ? "" : req.value().strip();
        return value.isEmpty() ? null : value;
    }
}
