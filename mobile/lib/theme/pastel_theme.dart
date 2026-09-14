import 'package:flutter/material.dart';

class PastelColors {
  static const Color cream = Color(0xFFFFFDF5);
  static const Color amber = Color(0xFFFEF3C7);
  static const Color sage = Color(0xFFDCFCE7);
  static const Color sky = Color(0xFFE0F2FE);
  static const Color lavender = Color(0xFFF3E8FF);
  static const Color rose = Color(0xFFFFE4E6);
  static const Color peach = Color(0xFFFFEDD5);
  static const Color mint = Color(0xFFCCFBF1);
  static const Color background = Color(0xFFFBFBFA);

  static Color parseHex(String hexColor) {
    try {
      String clean = hexColor.toUpperCase().replaceAll('#', '');
      if (clean.length == 6) {
        clean = 'FF$clean';
      }
      return Color(int.parse(clean, radix: 16));
    } catch (_) {
      return Colors.white;
    }
  }
}

class JantTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: PastelColors.background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFFF59E0B),
        surface: PastelColors.background,
        primary: const Color(0xFF0F172A),
        secondary: const Color(0xFFD97706),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: PastelColors.background,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        iconTheme: IconThemeData(color: Color(0xFF0F172A)),
        titleTextStyle: TextStyle(
          color: Color(0xFF0F172A),
          fontSize: 22,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.5,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
        ),
      ),
      // Area di tocco minima su tutti i controlli, come da linee guida di piattaforma.
      materialTapTargetSize: MaterialTapTargetSize.padded,
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          minimumSize: const Size(48, 48),
          foregroundColor: const Color(0xFF44403C),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(64, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(minimumSize: const Size(64, 48)),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(64, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: const Color(0xFF1C1917),
        contentTextStyle: const TextStyle(color: Colors.white, fontSize: 13.5),
        actionTextColor: const Color(0xFFFCD34D),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      listTileTheme: const ListTileThemeData(minVerticalPadding: 10),
    );
  }
}
