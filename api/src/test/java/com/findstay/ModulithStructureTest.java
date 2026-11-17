package com.findstay;

import com.findstay.testing.Req;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

@Req("C5")
class ModulithStructureTest {

    @Test
    void verifiesModularStructure() {
        ApplicationModules.of(FindStayApplication.class).verify();
    }
}
