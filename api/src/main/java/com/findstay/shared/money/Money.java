package com.findstay.shared.money;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * An amount of Ghana cedis stored as a whole number of <b>pesewas</b> (100 pesewas = GH₵1).
 *
 * <p>Rules for the whole codebase:
 * <ul>
 *   <li>Money is never a {@code double}, {@code float} or fractional {@code BigDecimal}.</li>
 *   <li>The database column holds the plain {@code long} (e.g. {@code amount_pesewas BIGINT}).</li>
 *   <li>The JSON API sends and receives the plain integer: {@code 1250} means GH₵12.50.</li>
 *   <li>Arithmetic is overflow-checked: an overflow throws instead of wrapping around.</li>
 * </ul>
 */
public record Money(long pesewas) implements Comparable<Money> {

    public static final Money ZERO = new Money(0);

    private static final long PESEWAS_PER_CEDI = 100;
    private static final Pattern CEDI_AMOUNT = Pattern.compile("-?\\d+(\\.\\d{1,2})?");

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static Money ofPesewas(long pesewas) {
        return new Money(pesewas);
    }

    /** Whole cedis, e.g. {@code ofCedis(12)} is GH₵12.00. */
    public static Money ofCedis(long cedis) {
        return new Money(Math.multiplyExact(cedis, PESEWAS_PER_CEDI));
    }

    /**
     * Parses a decimal cedi string such as {@code "12"}, {@code "12.5"} or {@code "12.50"}.
     * More than two decimal places is an error: amounts are never silently rounded.
     */
    public static Money parse(String cedis) {
        if (cedis == null || !CEDI_AMOUNT.matcher(cedis).matches()) {
            throw new IllegalArgumentException(
                    "Not a valid cedi amount (up to 2 decimal places): " + cedis);
        }
        return new Money(new BigDecimal(cedis).movePointRight(2).longValueExact());
    }

    @JsonValue
    @Override
    public long pesewas() {
        return pesewas;
    }

    public Money plus(Money other) {
        return new Money(Math.addExact(pesewas, other.pesewas));
    }

    public Money minus(Money other) {
        return new Money(Math.subtractExact(pesewas, other.pesewas));
    }

    public Money negate() {
        return new Money(Math.negateExact(pesewas));
    }

    public Money times(long factor) {
        return new Money(Math.multiplyExact(pesewas, factor));
    }

    /**
     * Takes a percentage given in basis points (1 bp = 0.01%), e.g. 250 = 2.5%.
     * The result is rounded to the nearest pesewa, halves away from zero ({@code HALF_UP}).
     * Uses exact integer-scale arithmetic, so there is no floating-point error.
     */
    public Money percentage(long basisPoints) {
        long result = BigDecimal.valueOf(pesewas)
                .multiply(BigDecimal.valueOf(basisPoints))
                .divide(BigDecimal.valueOf(10_000), 0, RoundingMode.HALF_UP)
                .longValueExact();
        return new Money(result);
    }

    /**
     * Splits this amount by ratio without losing or creating a single pesewa.
     * Leftover pesewas go one each to the first non-zero shares, so the parts always add up
     * to the original amount. Example: GH₵1.00 split {@code (1, 1, 1)} gives 34p, 33p, 33p.
     */
    public List<Money> allocate(long... ratios) {
        if (ratios.length == 0) {
            throw new IllegalArgumentException("At least one ratio is required");
        }
        long total = 0;
        for (long ratio : ratios) {
            if (ratio < 0) {
                throw new IllegalArgumentException("Ratios must not be negative");
            }
            total = Math.addExact(total, ratio);
        }
        if (total == 0) {
            throw new IllegalArgumentException("At least one ratio must be greater than zero");
        }

        boolean negative = pesewas < 0;
        BigInteger absolute = BigInteger.valueOf(pesewas).abs();
        BigInteger totalRatio = BigInteger.valueOf(total);

        long[] shares = new long[ratios.length];
        long allocated = 0;
        for (int i = 0; i < ratios.length; i++) {
            shares[i] = absolute.multiply(BigInteger.valueOf(ratios[i]))
                    .divide(totalRatio)
                    .longValueExact();
            allocated += shares[i];
        }

        long remainder = absolute.longValueExact() - allocated;
        for (int i = 0; remainder > 0; i = (i + 1) % ratios.length) {
            if (ratios[i] > 0) {
                shares[i]++;
                remainder--;
            }
        }

        List<Money> parts = new ArrayList<>(ratios.length);
        for (long share : shares) {
            parts.add(new Money(negative ? -share : share));
        }
        return List.copyOf(parts);
    }

    /** Splits into {@code parts} near-equal amounts that add up exactly to this amount. */
    public List<Money> split(int parts) {
        if (parts <= 0) {
            throw new IllegalArgumentException("parts must be positive");
        }
        long[] ratios = new long[parts];
        java.util.Arrays.fill(ratios, 1L);
        return allocate(ratios);
    }

    public boolean isZero() {
        return pesewas == 0;
    }

    public boolean isPositive() {
        return pesewas > 0;
    }

    public boolean isNegative() {
        return pesewas < 0;
    }

    public boolean isGreaterThan(Money other) {
        return pesewas > other.pesewas;
    }

    public boolean isLessThan(Money other) {
        return pesewas < other.pesewas;
    }

    @Override
    public int compareTo(Money other) {
        return Long.compare(pesewas, other.pesewas);
    }

    /** Plain decimal cedis with exactly two places, e.g. {@code "12.50"}, {@code "-0.05"}. */
    public String toCedisString() {
        return BigDecimal.valueOf(pesewas, 2).toPlainString();
    }

    /** Human display with symbol and thousands separators, e.g. {@code "GH₵1,234.50"}. */
    public String display() {
        BigInteger[] cedisAndPesewas = BigInteger.valueOf(pesewas).abs()
                .divideAndRemainder(BigInteger.valueOf(PESEWAS_PER_CEDI));
        String cedis = String.format(Locale.ROOT, "%,d", cedisAndPesewas[0]);
        String pesewaPart = String.format(Locale.ROOT, "%02d", cedisAndPesewas[1].intValue());
        return (pesewas < 0 ? "-" : "") + "GH₵" + cedis + "." + pesewaPart;
    }

    /** For logs and debugging, e.g. {@code "GHS 12.50"}. */
    @Override
    public String toString() {
        return "GHS " + toCedisString();
    }
}
