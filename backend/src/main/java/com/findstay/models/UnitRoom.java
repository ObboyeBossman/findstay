package com.findstay.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "units_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "unit_name", nullable = false, length = 100)
    private String unitName;

    @Column(name = "room_type", nullable = false, length = 50)
    private String roomType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "price_per_month", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerMonth;

    @Column(name = "price_per_semester", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerSemester;

    @Column(nullable = false)
    private String status; // 'AVAILABLE', 'HELD', 'BOOKED', 'MAINTENANCE'

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
