import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';
import 'blocs/items/items_bloc.dart';
import 'theme/pastel_theme.dart';
import 'screens/home_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Date, calendari e selettori orario seguono la lingua dell'interfaccia.
  await initializeDateFormatting('it_IT');
  Intl.defaultLocale = 'it_IT';
  runApp(const JantApp());
}

class JantApp extends StatelessWidget {
  const JantApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<ItemsBloc>(
          create: (_) => ItemsBloc(),
        ),
      ],
      child: MaterialApp(
        title: 'J.A.N.T.',
        debugShowCheckedModeBanner: false,
        theme: JantTheme.lightTheme,
        locale: const Locale('it', 'IT'),
        supportedLocales: const [Locale('it', 'IT'), Locale('en', 'US')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        home: const HomeScreen(),
      ),
    );
  }
}
