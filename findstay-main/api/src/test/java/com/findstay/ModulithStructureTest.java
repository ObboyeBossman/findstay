package com.findstay;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModulithStructureTest {

    @Test
    void verifiesModularStructure() {
        ApplicationModules.of(FindStayApplication.class).verify();
    }
}
