import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'blocs/items/items_bloc.dart';
import 'theme/pastel_theme.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
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
        home: const HomeScreen(),
      ),
    );
  }
}
