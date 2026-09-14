package com.veriscreen.helsb.catalog;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

public final class InstitutionCatalog {

    private InstitutionCatalog() {
    }

    public record Programme(String code, String name) {
    }

    public record School(String code, String name, List<Programme> programmes) {
    }

    public record University(String code, String name, String abbreviation, List<School> schools) {
    }

    public static final List<University> UNIVERSITIES = List.of(
            unza(),
            createUniversity("CBU", "Copperbelt University", "CBU",
                    createSchool("BUS", "School of Business"),
                    createSchool("ENG", "School of Engineering"),
                    createSchool("NAS", "School of Natural Sciences")),
            createUniversity("MUL", "Mulungushi University", "MU",
                    createSchool("BUS", "School of Business Studies"),
                    createSchool("AGR", "School of Agriculture and Natural Resources"),
                    createSchool("SCI", "School of Science, Engineering and Technology")),
            createUniversity("CHAU", "Chalimbana University", "CHAU",
                    createSchool("EDU", "School of Education"),
                    createSchool("BUS", "School of Business")),
            createUniversity("KMU", "Kapasa Makasa University", "KMU",
                    createSchool("SCI", "School of Science and Technology"),
                    createSchool("AGR", "School of Agriculture")),
            createUniversity("KNU", "Kwame Nkrumah University", "KNU",
                    createSchool("EDU", "School of Education"),
                    createSchool("NAS", "School of Natural Sciences")),
            createUniversity("PU", "Palabana University", "PU",
                    createSchool("AGR", "School of Agriculture"),
                    createSchool("VET", "School of Veterinary Medicine")),
            createUniversity("MUK", "Mukuba University", "MU",
                    createSchool("EDU", "School of Education"),
                    createSchool("NAS", "School of Natural Sciences")),
            createUniversity("LMMU", "Levy Mwanawasa Medical University", "LMMU",
                    createSchool("MED", "School of Medicine"),
                    createSchool("HS", "School of Health Sciences"),
                    createSchool("NUR", "School of Nursing")),
            createUniversity("ZUT", "Zambia University College of Technology", "ZUT",
                    createSchool("ICT", "School of Information and Communication Technology"),
                    createSchool("ENG", "School of Engineering"))
    );

    public static Optional<University> findUniversity(String code) {
        return UNIVERSITIES.stream().filter(item -> item.code().equalsIgnoreCase(code)).findFirst();
    }

    public static Placement place(String faculty, String programme) {
        String haystack = ((faculty == null ? "" : faculty) + " " + (programme == null ? "" : programme))
                .toLowerCase(Locale.ROOT);
        if (containsAny(haystack, "law")) {
            return new Placement("UNZA", "LAW", "School of Law", orDefault(programme, "Bachelor of Laws"));
        }
        if (containsAny(haystack, "nurs")) {
            return new Placement("UNZA", "NUR", "School of Nursing Sciences", orDefault(programme, "Nursing"));
        }
        if (containsAny(haystack, "public health")) {
            return new Placement("UNZA", "PH", "School of Public Health", orDefault(programme, "Public Health"));
        }
        if (containsAny(haystack, "health science", "biomed", "pharmacy", "physio")) {
            return new Placement("UNZA", "HS", "School of Health Sciences", orDefault(programme, programme));
        }
        if (containsAny(haystack, "medicine", "mbchb")) {
            return new Placement("UNZA", "MED", "School of Medicine", orDefault(programme, "MBChB"));
        }
        if (containsAny(haystack, "mine", "geolog", "metall")) {
            return new Placement("UNZA", "MIN", "School of Mines", orDefault(programme, programme));
        }
        if (containsAny(haystack, "engine")) {
            return new Placement("UNZA", "ENG", "School of Engineering", orDefault(programme, "Electrical Engineering"));
        }
        if (containsAny(haystack, "agric")) {
            return new Placement("UNZA", "AGR", "School of Agriculture", orDefault(programme, programme));
        }
        if (containsAny(haystack, "veterin")) {
            return new Placement("UNZA", "VET", "School of Veterinary Medicine", orDefault(programme, "Veterinary Medicine"));
        }
        if (containsAny(haystack, "educat")) {
            return new Placement("UNZA", "EDU", "School of Education", orDefault(programme, programme));
        }
        if (containsAny(haystack, "natural", "computer", "information technology", "physics", "chemistry", "mathematics", "biolog")) {
            return new Placement(
                    "UNZA",
                    "NAS",
                    "School of Natural and Applied Sciences",
                    orDefault(programme, "Computer Science"));
        }
        return new Placement("UNZA", "HUM", "School of Humanities", orDefault(programme, "Economics"));
    }

    public record Placement(String universityCode, String schoolCode, String schoolName, String programme) {
    }

    private static University unza() {
        return createUniversity("UNZA", "University of Zambia", "UNZA",
                new School("HUM", "School of Humanities", List.of(
                        new Programme("ECO", "Economics"),
                        new Programme("DEV", "Development Studies"),
                        new Programme("POL", "Political Science"),
                        new Programme("HIS", "History"),
                        new Programme("PHI", "Philosophy"))),
                new School("NAS", "School of Natural and Applied Sciences", List.of(
                        new Programme("CSC", "Computer Science"),
                        new Programme("ICT", "Information Technology"),
                        new Programme("PHY", "Physics"),
                        new Programme("CHE", "Chemistry"),
                        new Programme("MAT", "Mathematics"),
                        new Programme("BIO", "Biological Sciences"))),
                new School("LAW", "School of Law", List.of(
                        new Programme("LLB", "Bachelor of Laws"))),
                new School("VET", "School of Veterinary Medicine", List.of(
                        new Programme("DVM", "Veterinary Medicine"))),
                new School("AGR", "School of Agriculture", List.of(
                        new Programme("AGR", "Agronomy"),
                        new Programme("ANS", "Animal Science"),
                        new Programme("AEC", "Agricultural Economics"))),
                new School("EDU", "School of Education", List.of(
                        new Programme("AED", "Adult Education"),
                        new Programme("EAD", "Educational Administration"),
                        new Programme("MED", "Mathematics Education"))),
                new School("ENG", "School of Engineering", List.of(
                        new Programme("EEE", "Electrical Engineering"),
                        new Programme("CVE", "Civil Engineering"),
                        new Programme("MEE", "Mechanical Engineering"),
                        new Programme("AGE", "Agricultural Engineering"))),
                new School("MIN", "School of Mines", List.of(
                        new Programme("MIN", "Mining Engineering"),
                        new Programme("GEO", "Geology"),
                        new Programme("MET", "Metallurgy"))),
                new School("MED", "School of Medicine", List.of(
                        new Programme("MBC", "MBChB"),
                        new Programme("HBI", "Human Biology"))),
                new School("HS", "School of Health Sciences", List.of(
                        new Programme("BMS", "Biomedical Sciences"),
                        new Programme("PHT", "Physiotherapy"),
                        new Programme("PHA", "Pharmacy"))),
                new School("PH", "School of Public Health", List.of(
                        new Programme("PH", "Public Health"),
                        new Programme("EH", "Environmental Health"))),
                new School("NUR", "School of Nursing Sciences", List.of(
                        new Programme("NUR", "Nursing"),
                        new Programme("MID", "Midwifery"))));
    }

    private static University createUniversity(String code, String name, String abbreviation, School... schools) {
        return new University(code, name, abbreviation, List.of(schools));
    }

    private static School createSchool(String code, String name, Programme... programmes) {
        if (programmes.length == 0) {
            return new School(code, name, List.of(new Programme("GEN", "General")));
        }
        return new School(code, name, List.of(programmes));
    }

    private static boolean containsAny(String haystack, String... needles) {
        for (String needle : needles) {
            if (haystack.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private static String orDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
