import { NavigationProp, ParamListBase } from '@react-navigation/native';

export type MainTabRoute = 'AnaSayfa' | 'Yemekler' | 'Spor' | 'Gelisim';

export function navigateToMainTab(
  navigation: NavigationProp<ParamListBase>,
  screen: MainTabRoute
): void {
  let current: NavigationProp<ParamListBase> | undefined = navigation;

  while (current) {
    const state = current.getState();
    const routeNames = state?.routeNames ?? [];

    if (routeNames.includes(screen)) {
      current.navigate(screen);
      return;
    }

    if (routeNames.includes('Tabs')) {
      current.navigate('Tabs', { screen });
      return;
    }

    if (routeNames.includes('Main')) {
      current.navigate('Main', { screen: 'Tabs', params: { screen } });
      return;
    }

    current = current.getParent() ?? undefined;
  }
}

export function navigateToProfile(navigation: NavigationProp<ParamListBase>): void {
  let current: NavigationProp<ParamListBase> | undefined = navigation;

  while (current) {
    const state = current.getState();
    const routeNames = state?.routeNames ?? [];

    if (routeNames.includes('Profil')) {
      current.navigate('Profil');
      return;
    }

    if (routeNames.includes('Main')) {
      current.navigate('Main', { screen: 'Profil' });
      return;
    }

    current = current.getParent() ?? undefined;
  }
}
