package com.findstay.shared.money;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MoneyTest {

    @Test
    void storesWholePesewas() {
        assertThat(Money.ofPesewas(1250).pesewas()).isEqualTo(1250);
        assertThat(Money.ofCedis(12).pesewas()).isEqualTo(1200);
    }

    @Test
    void parsesCedisWithoutFloatingPointError() {
        assertThat(Money.parse("12.50")).isEqualTo(Money.ofPesewas(1250));
        assertThat(Money.parse("12.5")).isEqualTo(Money.ofPesewas(1250));
        assertThat(Money.parse("12")).isEqualTo(Money.ofPesewas(1200));
        assertThat(Money.parse("0.10").plus(Money.parse("0.20"))).isEqualTo(Money.parse("0.30"));
        assertThat(Money.parse("-0.05")).isEqualTo(Money.ofPesewas(-5));
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "abc", "12.505", "1e3", "12,50", " 12", "12.", ".5", "--1"})
    void rejectsAmountsThatWouldNeedRounding(String input) {
        assertThatThrownBy(() -> Money.parse(input)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsNull() {
        assertThatThrownBy(() -> Money.parse(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void arithmeticIsExact() {
        Money a = Money.ofPesewas(1000);
        Money b = Money.ofPesewas(250);
        assertThat(a.plus(b)).isEqualTo(Money.ofPesewas(1250));
        assertThat(a.minus(b)).isEqualTo(Money.ofPesewas(750));
        assertThat(b.minus(a)).isEqualTo(Money.ofPesewas(-750));
        assertThat(b.times(4)).isEqualTo(a);
        assertThat(a.negate()).isEqualTo(Money.ofPesewas(-1000));
    }

    @Test
    void overflowThrowsInsteadOfWrappingAround() {
        Money max = Money.ofPesewas(Long.MAX_VALUE);
        assertThatThrownBy(() -> max.plus(Money.ofPesewas(1))).isInstanceOf(ArithmeticException.class);
        assertThatThrownBy(() -> max.times(2)).isInstanceOf(ArithmeticException.class);
        assertThatThrownBy(() -> Money.ofCedis(Long.MAX_VALUE)).isInstanceOf(ArithmeticException.class);
    }

    @Test
    void percentageUsesBasisPointsAndRoundsHalfUp() {
        // 2.5% of GH₵100.00 = GH₵2.50
        assertThat(Money.ofCedis(100).percentage(250)).isEqualTo(Money.ofPesewas(250));
        // 1.5% of 10p = 0.15p -> 0p ; 5% of 10p = 0.5p -> 1p ; 5% of -10p -> -1p
        assertThat(Money.ofPesewas(10).percentage(150)).isEqualTo(Money.ZERO);
        assertThat(Money.ofPesewas(10).percentage(500)).isEqualTo(Money.ofPesewas(1));
        assertThat(Money.ofPesewas(-10).percentage(500)).isEqualTo(Money.ofPesewas(-1));
    }

    @Test
    void allocateNeverLosesOrCreatesAPesewa() {
        List<Money> thirds = Money.ofCedis(1).allocate(1, 1, 1);
        assertThat(thirds).containsExactly(Money.ofPesewas(34), Money.ofPesewas(33), Money.ofPesewas(33));
        assertThat(total(thirds)).isEqualTo(Money.ofCedis(1));

        List<Money> uneven = Money.ofPesewas(101).allocate(70, 30);
        assertThat(total(uneven)).isEqualTo(Money.ofPesewas(101));
        assertThat(uneven).containsExactly(Money.ofPesewas(71), Money.ofPesewas(30));

        assertThat(Money.ofPesewas(-100).split(3))
                .containsExactly(Money.ofPesewas(-34), Money.ofPesewas(-33), Money.ofPesewas(-33));
        assertThat(Money.ofPesewas(5).allocate(0, 1)).containsExactly(Money.ZERO, Money.ofPesewas(5));
    }

    @Test
    void allocateRejectsBadRatios() {
        assertThatThrownBy(() -> Money.ofCedis(1).allocate()).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> Money.ofCedis(1).allocate(0, 0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> Money.ofCedis(1).allocate(1, -1)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> Money.ofCedis(1).split(0)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void comparesAndClassifies() {
        assertThat(Money.ofPesewas(5)).isLessThan(Money.ofPesewas(6));
        assertThat(Money.ofPesewas(6).isGreaterThan(Money.ofPesewas(5))).isTrue();
        assertThat(Money.ZERO.isZero()).isTrue();
        assertThat(Money.ofPesewas(-1).isNegative()).isTrue();
        assertThat(Money.ofPesewas(1).isPositive()).isTrue();
    }

    @Test
    void formatsForPeopleAndLogs() {
        assertThat(Money.ofPesewas(1250).toCedisString()).isEqualTo("12.50");
        assertThat(Money.ofPesewas(5).toCedisString()).isEqualTo("0.05");
        assertThat(Money.ofPesewas(-5).toCedisString()).isEqualTo("-0.05");
        assertThat(Money.ofPesewas(123_450).display()).isEqualTo("GH₵1,234.50");
        assertThat(Money.ofPesewas(5).display()).isEqualTo("GH₵0.05");
        assertThat(Money.ofPesewas(-123_450).display()).isEqualTo("-GH₵1,234.50");
        assertThat(Money.ofPesewas(1250)).hasToString("GHS 12.50");
    }

    private static Money total(List<Money> parts) {
        return parts.stream().reduce(Money.ZERO, Money::plus);
    }
}
